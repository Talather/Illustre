
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('client', 'closer', 'collaborator', 'admin');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('onboarding', 'in_progress', 'completed');

-- Create enum for product status
CREATE TYPE public.product_status AS ENUM ('pending', 'files_requested', 'in_production', 'delivered', 'revision_requested');

-- Create enum for onboarding step types
CREATE TYPE public.onboarding_step_type AS ENUM ('call_scheduled', 'contract_signed', 'payment_made', 'form_completed');

-- Create enum for revision status
CREATE TYPE public.revision_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create product_templates table
CREATE TABLE public.product_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    format TEXT NOT NULL, -- 'podcast', 'scripted', 'micro-interview'
    base_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    closer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    status order_status DEFAULT 'onboarding',
    is_subcontracted BOOLEAN DEFAULT FALSE,
    final_client_name TEXT,
    final_client_email TEXT,
    custom_branding JSONB,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_products table
CREATE TABLE public.order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.product_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    format TEXT NOT NULL,
    status product_status DEFAULT 'pending',
    responsible TEXT,
    instructions TEXT,
    deliverable_link TEXT,
    file_deposit_link TEXT,
    preparation_link TEXT,
    onboarding_form_link TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create onboarding_steps table
CREATE TABLE public.onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    step onboarding_step_type NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, step)
);

-- Create revisions table
CREATE TABLE public.revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_product_id UUID REFERENCES public.order_products(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status revision_status DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_links table (optional for additional file management)
CREATE TABLE public.file_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_product_id UUID REFERENCES public.order_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT, -- 'dropbox', 'frame_io', 'google_drive', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_links ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS app_role[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT ARRAY_AGG(role) FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);

-- Create RLS policies for product_templates
CREATE POLICY "Everyone can view product templates" ON public.product_templates FOR SELECT USING (true);

-- Create RLS policies for orders
CREATE POLICY "Users can view orders they're involved in" ON public.orders FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = closer_id OR
    'admin' = ANY(public.get_user_roles(auth.uid())) OR
    'collaborator' = ANY(public.get_user_roles(auth.uid()))
);

-- Create RLS policies for order_products
CREATE POLICY "Users can view order products for their orders" ON public.order_products FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_products.order_id 
        AND (
            orders.client_id = auth.uid() OR 
            orders.closer_id = auth.uid() OR
            'admin' = ANY(public.get_user_roles(auth.uid())) OR
            'collaborator' = ANY(public.get_user_roles(auth.uid()))
        )
    )
);

-- Create RLS policies for onboarding_steps
CREATE POLICY "Users can view onboarding steps for their orders" ON public.onboarding_steps FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = onboarding_steps.order_id 
        AND (
            orders.client_id = auth.uid() OR 
            orders.closer_id = auth.uid() OR
            'admin' = ANY(public.get_user_roles(auth.uid())) OR
            'collaborator' = ANY(public.get_user_roles(auth.uid()))
        )
    )
);

-- Create RLS policies for revisions
CREATE POLICY "Users can view revisions for their order products" ON public.revisions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.order_products 
        JOIN public.orders ON orders.id = order_products.order_id
        WHERE order_products.id = revisions.order_product_id 
        AND (
            orders.client_id = auth.uid() OR 
            orders.closer_id = auth.uid() OR
            'admin' = ANY(public.get_user_roles(auth.uid())) OR
            'collaborator' = ANY(public.get_user_roles(auth.uid()))
        )
    )
);

-- Create RLS policies for file_links
CREATE POLICY "Users can view file links for their order products" ON public.file_links FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.order_products 
        JOIN public.orders ON orders.id = order_products.order_id
        WHERE order_products.id = file_links.order_product_id 
        AND (
            orders.client_id = auth.uid() OR 
            orders.closer_id = auth.uid() OR
            'admin' = ANY(public.get_user_roles(auth.uid())) OR
            'collaborator' = ANY(public.get_user_roles(auth.uid()))
        )
    )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_templates_updated_at BEFORE UPDATE ON public.product_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_products_updated_at BEFORE UPDATE ON public.order_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_steps_updated_at BEFORE UPDATE ON public.onboarding_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_revisions_updated_at BEFORE UPDATE ON public.revisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert product templates based on current mock data
INSERT INTO public.product_templates (name, format, base_price, description) VALUES
('Podcast Basique', 'podcast', 2400.00, '3 vidéos podcast par mois'),
('Podcast Premium', 'podcast', 4500.00, '6 vidéos podcast par mois'),
('Scripted Basique', 'scripted', 2400.00, '3 vidéos scriptées par mois'),
('Scripted Premium', 'scripted', 4500.00, '6 vidéos scriptées par mois'),
('Micro-interview Basique', 'micro-interview', 2400.00, '3 micro-interviews par mois'),
('Micro-interview Premium', 'micro-interview', 4500.00, '6 micro-interviews par mois');

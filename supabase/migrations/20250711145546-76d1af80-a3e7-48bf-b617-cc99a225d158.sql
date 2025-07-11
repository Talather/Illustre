
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'closer', 'collaborator', 'client');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('onboarding', 'in_progress', 'completed', 'cancelled');

-- Create enum for product status
CREATE TYPE public.product_status AS ENUM ('pending', 'files_requested', 'in_production', 'delivered', 'revision_requested');

-- Create enum for onboarding step types
CREATE TYPE public.onboarding_step_type AS ENUM ('contract_signed', 'form_completed', 'payment_made', 'call_scheduled');

-- Create enum for revision status
CREATE TYPE public.revision_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create product_templates table with updated prices
CREATE TABLE public.product_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  video_count INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- 60000 for 3 videos, 120000 for 6, 150000 for 10
  format TEXT NOT NULL DEFAULT 'HD 1080p',
  duration_estimate TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  closer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status order_status NOT NULL DEFAULT 'onboarding',
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_payment_link TEXT,
  is_subcontracted BOOLEAN NOT NULL DEFAULT FALSE,
  custom_branding JSONB,
  final_client_name TEXT,
  notes TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_products table
CREATE TABLE public.order_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.product_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  status product_status NOT NULL DEFAULT 'pending',
  price_cents INTEGER NOT NULL,
  deliverable_link TEXT,
  preparation_link TEXT,
  responsible_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  instructions TEXT,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create onboarding_steps table
CREATE TABLE public.onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  step onboarding_step_type NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, step)
);

-- Create revisions table
CREATE TABLE public.revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.order_products(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  status revision_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create custom_options table
CREATE TABLE public.custom_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  option_name TEXT NOT NULL,
  option_value TEXT NOT NULL,
  price_adjustment_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create file_links table
CREATE TABLE public.file_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.order_products(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL, -- 'dropbox', 'frame_io', 'google_drive', etc.
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  access_level TEXT NOT NULL DEFAULT 'client', -- 'client', 'internal', 'collaborator'
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for orders
CREATE POLICY "Clients can view their own orders" ON public.orders
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Closers can view orders they created" ON public.orders
  FOR SELECT USING (closer_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for order_products
CREATE POLICY "Users can view products from their orders" ON public.order_products
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND (client_id = auth.uid() OR closer_id = auth.uid())
    )
  );

-- RLS Policies for onboarding_steps
CREATE POLICY "Users can view onboarding steps from their orders" ON public.onboarding_steps
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND (client_id = auth.uid() OR closer_id = auth.uid())
    )
  );

-- RLS Policies for revisions
CREATE POLICY "Users can view revisions they requested or are assigned to" ON public.revisions
  FOR SELECT USING (requested_by = auth.uid() OR assigned_to = auth.uid());

-- RLS Policies for file_links
CREATE POLICY "Users can view file links from their orders" ON public.file_links
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND (client_id = auth.uid() OR closer_id = auth.uid())
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email)
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'client');
  
  RETURN new;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default product templates with updated prices
INSERT INTO public.product_templates (name, description, video_count, price_cents, features) VALUES
(
  'Pack Starter', 
  'Pack idéal pour débuter avec 3 vidéos professionnelles',
  3,
  60000, -- 600€
  '["Montage professionnel", "Étalonnage couleur", "Mixage audio", "1 révision incluse"]'
),
(
  'Pack Business', 
  'Pack complet avec 6 vidéos pour développer votre communication',
  6,
  120000, -- 1200€
  '["Montage professionnel", "Étalonnage couleur", "Mixage audio", "Motion graphics", "2 révisions incluses", "Optimisation réseaux sociaux"]'
),
(
  'Pack Premium', 
  'Pack ultime avec 10 vidéos pour une stratégie complète',
  10,
  150000, -- 1500€
  '["Montage professionnel", "Étalonnage couleur", "Mixage audio", "Motion graphics avancés", "3 révisions incluses", "Optimisation multi-plateformes", "Stratégie de diffusion"]'
);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  order_count INTEGER;
  order_number TEXT;
BEGIN
  SELECT COUNT(*) INTO order_count FROM public.orders;
  order_number := 'ILL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((order_count + 1)::TEXT, 4, '0');
  RETURN order_number;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_templates_updated_at BEFORE UPDATE ON public.product_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_products_updated_at BEFORE UPDATE ON public.order_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_steps_updated_at BEFORE UPDATE ON public.onboarding_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revisions_updated_at BEFORE UPDATE ON public.revisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_file_links_updated_at BEFORE UPDATE ON public.file_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

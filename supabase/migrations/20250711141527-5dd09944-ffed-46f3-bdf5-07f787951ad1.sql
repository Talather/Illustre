
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types for better type safety
CREATE TYPE public.user_role AS ENUM ('client', 'closer', 'collaborator', 'admin');
CREATE TYPE public.order_status AS ENUM ('onboarding', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.product_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'revision_requested');
CREATE TYPE public.onboarding_step_type AS ENUM ('contract_signed', 'form_completed', 'payment_made', 'call_scheduled');
CREATE TYPE public.notification_type AS ENUM ('order_update', 'product_update', 'payment', 'revision_request', 'system');

-- Organizations table (multi-tenant architecture)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_subcontracted BOOLEAN DEFAULT false,
    parent_organization_id UUID REFERENCES public.organizations(id),
    
    -- Custom branding
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    custom_domain TEXT,
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (many-to-many with organizations)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    role public.user_role NOT NULL,
    
    -- Permissions context
    permissions JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, organization_id, role)
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    closer_id UUID REFERENCES public.profiles(id),
    
    -- Order details
    client_name TEXT NOT NULL,
    status public.order_status DEFAULT 'onboarding',
    title TEXT,
    description TEXT,
    
    -- Subcontracting details
    is_subcontracted BOOLEAN DEFAULT false,
    final_client_name TEXT,
    custom_branding JSONB,
    
    -- External integrations
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    frameio_project_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    collaborator_id UUID REFERENCES public.profiles(id),
    
    -- Product details
    title TEXT NOT NULL,
    format TEXT,
    status public.product_status DEFAULT 'pending',
    
    -- File management
    deliverable_link TEXT,
    preparation_link TEXT,
    
    -- Workflow
    responsible TEXT,
    instructions TEXT,
    next_action_date TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding steps table
CREATE TABLE public.onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    step public.onboarding_step_type NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    
    -- Step-specific data
    data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(order_id, step)
);

-- Revisions table
CREATE TABLE public.revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Revision details
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    
    -- Timestamps
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification details
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    
    -- Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Related entities
    related_id UUID,
    related_type TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Audit details
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_organizations(user_uuid UUID)
RETURNS TABLE(organization_id UUID, role public.user_role)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT ur.organization_id, ur.role
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid UUID, org_uuid UUID, role_name public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = user_uuid
        AND ur.organization_id = org_uuid
        AND ur.role = role_name
    );
$$;

CREATE OR REPLACE FUNCTION public.user_has_admin_role(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = user_uuid
        AND ur.role = 'admin'
    );
$$;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their organizations" ON public.organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM public.get_user_organizations(auth.uid()))
    );

CREATE POLICY "Admins can manage organizations" ON public.organizations
    FOR ALL USING (public.user_has_admin_role(auth.uid()));

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.user_has_admin_role(auth.uid()));

-- RLS Policies for User Roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (public.user_has_admin_role(auth.uid()));

-- RLS Policies for Orders
CREATE POLICY "Users can view orders in their organizations" ON public.orders
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM public.get_user_organizations(auth.uid()))
    );

CREATE POLICY "Closers and admins can manage orders" ON public.orders
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.get_user_organizations(auth.uid())
            WHERE role IN ('closer', 'admin')
        )
    );

CREATE POLICY "Clients can view their own orders" ON public.orders
    FOR SELECT USING (client_id = auth.uid());

-- RLS Policies for Products
CREATE POLICY "Users can view products in their organizations" ON public.products
    FOR SELECT USING (
        order_id IN (
            SELECT o.id 
            FROM public.orders o
            WHERE o.organization_id IN (SELECT organization_id FROM public.get_user_organizations(auth.uid()))
        )
    );

CREATE POLICY "Collaborators can manage assigned products" ON public.products
    FOR ALL USING (
        collaborator_id = auth.uid() OR
        order_id IN (
            SELECT o.id 
            FROM public.orders o
            WHERE o.organization_id IN (
                SELECT organization_id 
                FROM public.get_user_organizations(auth.uid())
                WHERE role IN ('closer', 'admin')
            )
        )
    );

-- RLS Policies for Onboarding Steps
CREATE POLICY "Users can view onboarding steps for their orders" ON public.onboarding_steps
    FOR SELECT USING (
        order_id IN (
            SELECT o.id 
            FROM public.orders o
            WHERE o.organization_id IN (SELECT organization_id FROM public.get_user_organizations(auth.uid()))
            OR o.client_id = auth.uid()
        )
    );

CREATE POLICY "Closers and admins can manage onboarding steps" ON public.onboarding_steps
    FOR ALL USING (
        order_id IN (
            SELECT o.id 
            FROM public.orders o
            WHERE o.organization_id IN (
                SELECT organization_id 
                FROM public.get_user_organizations(auth.uid())
                WHERE role IN ('closer', 'admin')
            )
        )
    );

-- RLS Policies for Revisions
CREATE POLICY "Users can view revisions for their products" ON public.revisions
    FOR SELECT USING (
        product_id IN (
            SELECT p.id 
            FROM public.products p
            JOIN public.orders o ON p.order_id = o.id
            WHERE o.organization_id IN (SELECT organization_id FROM public.get_user_organizations(auth.uid()))
            OR o.client_id = auth.uid()
            OR p.collaborator_id = auth.uid()
        )
    );

CREATE POLICY "Clients can create revision requests" ON public.revisions
    FOR INSERT WITH CHECK (
        requested_by = auth.uid() AND
        product_id IN (
            SELECT p.id 
            FROM public.products p
            JOIN public.orders o ON p.order_id = o.id
            WHERE o.client_id = auth.uid()
        )
    );

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for Audit Logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.user_has_admin_role(auth.uid()));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_steps_updated_at BEFORE UPDATE ON public.onboarding_steps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revisions_updated_at BEFORE UPDATE ON public.revisions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_user_roles_user_org ON public.user_roles(user_id, organization_id);
CREATE INDEX idx_user_roles_org_role ON public.user_roles(organization_id, role);
CREATE INDEX idx_orders_client_status ON public.orders(client_id, status);
CREATE INDEX idx_orders_org_status ON public.orders(organization_id, status);
CREATE INDEX idx_products_order_status ON public.products(order_id, status);
CREATE INDEX idx_products_collaborator ON public.products(collaborator_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_audit_logs_org_created ON public.audit_logs(organization_id, created_at);

-- Insert default organization (illustre!)
INSERT INTO public.organizations (name, slug, is_subcontracted) 
VALUES ('illustre!', 'illustre', false);

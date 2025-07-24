-- Create orders table with JSON columns for products and custom options
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    closer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional, can be NULL if client creates order directly
    order_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'onboarding', 'in_progress', 'completed', 'cancelled')),
    products JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of product objects
    custom_options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of custom option objects
    total_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_closer_id ON orders(closer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_products ON orders USING GIN (products);
CREATE INDEX idx_orders_custom_options ON orders USING GIN (custom_options);

-- Create updated_at trigger for orders table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own orders
CREATE POLICY "Users can view their own orders as client" ON orders
    FOR SELECT USING (auth.uid() = client_id);

-- Policy for closers to see all orders
CREATE POLICY "Closers can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND 'closer' = ANY(users.roles)
        )
    );

-- Policy for closers to create orders
CREATE POLICY "Closers can create orders" ON orders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND 'closer' = ANY(users.roles)
        )
    );

-- Policy for admins to do everything
CREATE POLICY "Admins can do everything on orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND 'admin' = ANY(users.roles)
        )
    );
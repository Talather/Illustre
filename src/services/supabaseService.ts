
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Type definitions based on database schema
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderProduct = Database['public']['Tables']['order_products']['Row'];
export type OnboardingStep = Database['public']['Tables']['onboarding_steps']['Row'];
export type ProductTemplate = Database['public']['Tables']['product_templates']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type Revision = Database['public']['Tables']['revisions']['Row'];

// Profile services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return data;
  }
};

// User roles services
export const userRoleService = {
  async getUserRoles(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
    
    return data.map(row => row.role);
  },

  async updateUserRoles(userId: string, roles: string[]): Promise<boolean> {
    // First delete existing roles
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting user roles:', deleteError);
      return false;
    }
    
    // Then insert new roles
    const roleInserts = roles.map(role => ({
      user_id: userId,
      role: role as Database['public']['Enums']['app_role']
    }));
    
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(roleInserts);
    
    if (insertError) {
      console.error('Error inserting user roles:', insertError);
      return false;
    }
    
    return true;
  }
};

// Orders services
export const orderService = {
  async getOrdersByClientId(clientId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return data;
  },

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return data;
  }
};

// Order products services
export const orderProductService = {
  async getProductsByOrderId(orderId: string): Promise<OrderProduct[]> {
    const { data, error } = await supabase
      .from('order_products')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at');
    
    if (error) {
      console.error('Error fetching order products:', error);
      return [];
    }
    
    return data;
  },

  async updateProductStatus(productId: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('order_products')
      .update({ status: status as Database['public']['Enums']['product_status'] })
      .eq('id', productId);
    
    if (error) {
      console.error('Error updating product status:', error);
      return false;
    }
    
    return true;
  }
};

// Onboarding steps services
export const onboardingStepService = {
  async getOnboardingStepsByOrderId(orderId: string): Promise<OnboardingStep[]> {
    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at');
    
    if (error) {
      console.error('Error fetching onboarding steps:', error);
      return [];
    }
    
    return data;
  },

  async updateStepCompleted(stepId: string, completed: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('onboarding_steps')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', stepId);
    
    if (error) {
      console.error('Error updating onboarding step:', error);
      return false;
    }
    
    return true;
  }
};

// Product templates services
export const productTemplateService = {
  async getAllTemplates(): Promise<ProductTemplate[]> {
    const { data, error } = await supabase
      .from('product_templates')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching product templates:', error);
      return [];
    }
    
    return data;
  }
};

// Revisions services
export const revisionService = {
  async getRevisionsByProductId(productId: string): Promise<Revision[]> {
    const { data, error } = await supabase
      .from('revisions')
      .select('*')
      .eq('order_product_id', productId)
      .order('requested_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching revisions:', error);
      return [];
    }
    
    return data;
  },

  async createRevision(productId: string, description: string): Promise<Revision | null> {
    const { data, error } = await supabase
      .from('revisions')
      .insert({
        order_product_id: productId,
        description,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating revision:', error);
      return null;
    }
    
    return data;
  }
};

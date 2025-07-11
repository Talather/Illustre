export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      custom_options: {
        Row: {
          created_at: string
          id: string
          option_name: string
          option_value: string
          order_id: string
          price_adjustment_cents: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_name: string
          option_value: string
          order_id: string
          price_adjustment_cents?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          option_name?: string
          option_value?: string
          order_id?: string
          price_adjustment_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_options_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      file_links: {
        Row: {
          access_level: string
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          link_type: string
          order_id: string | null
          product_id: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          link_type: string
          order_id?: string | null
          product_id?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          link_type?: string
          order_id?: string | null
          product_id?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "order_products"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_steps: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          step: Database["public"]["Enums"]["onboarding_step_type"]
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          step: Database["public"]["Enums"]["onboarding_step_type"]
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          step?: Database["public"]["Enums"]["onboarding_step_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_steps_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_products: {
        Row: {
          actual_delivery: string | null
          created_at: string
          deliverable_link: string | null
          estimated_delivery: string | null
          format: string
          id: string
          instructions: string | null
          order_id: string
          preparation_link: string | null
          price_cents: number
          responsible_id: string | null
          status: Database["public"]["Enums"]["product_status"]
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          deliverable_link?: string | null
          estimated_delivery?: string | null
          format: string
          id?: string
          instructions?: string | null
          order_id: string
          preparation_link?: string | null
          price_cents: number
          responsible_id?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          deliverable_link?: string | null
          estimated_delivery?: string | null
          format?: string
          id?: string
          instructions?: string | null
          order_id?: string
          preparation_link?: string | null
          price_cents?: number
          responsible_id?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string
          closer_id: string | null
          created_at: string
          currency: string
          custom_branding: Json | null
          due_date: string | null
          final_client_name: string | null
          id: string
          is_subcontracted: boolean
          notes: string | null
          order_number: string
          organization_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_link: string | null
          total_amount_cents: number
          updated_at: string
        }
        Insert: {
          client_id: string
          closer_id?: string | null
          created_at?: string
          currency?: string
          custom_branding?: Json | null
          due_date?: string | null
          final_client_name?: string | null
          id?: string
          is_subcontracted?: boolean
          notes?: string | null
          order_number: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_link?: string | null
          total_amount_cents?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          closer_id?: string | null
          created_at?: string
          currency?: string
          custom_branding?: Json | null
          due_date?: string | null
          final_client_name?: string | null
          id?: string
          is_subcontracted?: boolean
          notes?: string | null
          order_number?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_link?: string | null
          total_amount_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_templates: {
        Row: {
          created_at: string
          description: string | null
          duration_estimate: string | null
          features: Json | null
          format: string
          id: string
          is_active: boolean
          name: string
          price_cents: number
          updated_at: string
          video_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_estimate?: string | null
          features?: Json | null
          format?: string
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          updated_at?: string
          video_count: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_estimate?: string | null
          features?: Json | null
          format?: string
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          updated_at?: string
          video_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revisions: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string
          id: string
          notes: string | null
          product_id: string
          requested_at: string
          requested_by: string
          status: Database["public"]["Enums"]["revision_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          product_id: string
          requested_at?: string
          requested_by: string
          status?: Database["public"]["Enums"]["revision_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          product_id?: string
          requested_at?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["revision_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revisions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revisions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "order_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revisions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "closer" | "collaborator" | "client"
      onboarding_step_type:
        | "contract_signed"
        | "form_completed"
        | "payment_made"
        | "call_scheduled"
      order_status: "onboarding" | "in_progress" | "completed" | "cancelled"
      product_status:
        | "pending"
        | "files_requested"
        | "in_production"
        | "delivered"
        | "revision_requested"
      revision_status: "pending" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "closer", "collaborator", "client"],
      onboarding_step_type: [
        "contract_signed",
        "form_completed",
        "payment_made",
        "call_scheduled",
      ],
      order_status: ["onboarding", "in_progress", "completed", "cancelled"],
      product_status: [
        "pending",
        "files_requested",
        "in_production",
        "delivered",
        "revision_requested",
      ],
      revision_status: ["pending", "in_progress", "completed"],
    },
  },
} as const

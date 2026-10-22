export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_api_keys: {
        Row: {
          created_at: string
          email: string
          id: string
          key_hash: string
          label: string | null
          last_used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          key_hash: string
          label?: string | null
          last_used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          key_hash?: string
          label?: string | null
          last_used_at?: string | null
        }
        Relationships: []
      }
      agent_hold_log: {
        Row: {
          appointment_id: string | null
          caller_hash: string
          created_at: string
          id: string
        }
        Insert: {
          appointment_id?: string | null
          caller_hash: string
          created_at?: string
          id?: string
        }
        Update: {
          appointment_id?: string | null
          caller_hash?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_hold_log_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_log: {
        Row: {
          bucket: string
          caller_hash: string
          created_at: string
          id: string
        }
        Insert: {
          bucket: string
          caller_hash: string
          created_at?: string
          id?: string
        }
        Update: {
          bucket?: string
          caller_hash?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          access_token: string | null
          aftercare_sent_at: string | null
          booking_date: string
          client_confirmed_at: string | null
          client_name: string
          concept_sketch_path: string | null
          created_at: string
          day_of_sent_at: string | null
          email: string
          hold_expires_at: string | null
          hold_secret: string | null
          id: string
          idea_description: string | null
          notes: string | null
          paddle_transaction_id: string | null
          payment_status: string
          phone: string
          pronouns: string | null
          reference_image_path: string | null
          reminder_sent_at: string | null
          reschedule_count: number
          rescheduled_at: string | null
          sketch_attempts: number
          sms_reminder_at: string | null
          sms_reminder_status: string | null
          social_sent_at: string | null
          source: string
          status: string
          time_slot: string
        }
        Insert: {
          access_token?: string | null
          aftercare_sent_at?: string | null
          booking_date: string
          client_confirmed_at?: string | null
          client_name: string
          concept_sketch_path?: string | null
          created_at?: string
          day_of_sent_at?: string | null
          email: string
          hold_expires_at?: string | null
          hold_secret?: string | null
          id?: string
          idea_description?: string | null
          notes?: string | null
          paddle_transaction_id?: string | null
          payment_status?: string
          phone: string
          pronouns?: string | null
          reference_image_path?: string | null
          reminder_sent_at?: string | null
          reschedule_count?: number
          rescheduled_at?: string | null
          sketch_attempts?: number
          sms_reminder_at?: string | null
          sms_reminder_status?: string | null
          social_sent_at?: string | null
          source?: string
          status?: string
          time_slot: string
        }
        Update: {
          access_token?: string | null
          aftercare_sent_at?: string | null
          booking_date?: string
          client_confirmed_at?: string | null
          client_name?: string
          concept_sketch_path?: string | null
          created_at?: string
          day_of_sent_at?: string | null
          email?: string
          hold_expires_at?: string | null
          hold_secret?: string | null
          id?: string
          idea_description?: string | null
          notes?: string | null
          paddle_transaction_id?: string | null
          payment_status?: string
          phone?: string
          pronouns?: string | null
          reference_image_path?: string | null
          reminder_sent_at?: string | null
          reschedule_count?: number
          rescheduled_at?: string | null
          sketch_attempts?: number
          sms_reminder_at?: string | null
          sms_reminder_status?: string | null
          social_sent_at?: string | null
          source?: string
          status?: string
          time_slot?: string
        }
        Relationships: []
      }
      blocked_slots: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
          time_slot: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          time_slot?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          time_slot?: string | null
        }
        Relationships: []
      }
      cron_tokens: {
        Row: {
          created_at: string
          name: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          name: string
          token_hash: string
        }
        Update: {
          created_at?: string
          name?: string
          token_hash?: string
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          caller_hash: string
          created_at: string
          key: string
          response: Json
        }
        Insert: {
          caller_hash: string
          created_at?: string
          key: string
          response: Json
        }
        Update: {
          caller_hash?: string
          created_at?: string
          key?: string
          response?: Json
        }
        Relationships: []
      }
      reminder_runs: {
        Row: {
          failed: number
          id: string
          ran_at: string
          sent: number
          skipped_reason: string | null
          sms_simulated: number
          suppressed: number
        }
        Insert: {
          failed?: number
          id?: string
          ran_at?: string
          sent?: number
          skipped_reason?: string | null
          sms_simulated?: number
          suppressed?: number
        }
        Update: {
          failed?: number
          id?: string
          ran_at?: string
          sent?: number
          skipped_reason?: string | null
          sms_simulated?: number
          suppressed?: number
        }
        Relationships: []
      }
      sketch_usage: {
        Row: {
          bucket_key: string
          usage_day: string
          uses: number
        }
        Insert: {
          bucket_key: string
          usage_day?: string
          uses?: number
        }
        Update: {
          bucket_key?: string
          usage_day?: string
          uses?: number
        }
        Relationships: []
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
        Relationships: []
      }
      webhook_subscriptions: {
        Row: {
          created_at: string
          events: string[]
          id: string
          manage_token: string
          secret: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          manage_token: string
          secret: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          manage_token?: string
          secret?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_appointment:
        | {
            Args: {
              p_date: string
              p_email: string
              p_name: string
              p_phone: string
              p_time_slot: string
            }
            Returns: string
          }
        | {
            Args: {
              p_date: string
              p_email: string
              p_name: string
              p_phone: string
              p_pronouns: string
              p_time_slot: string
            }
            Returns: string
          }
      check_reminder_cron_token: { Args: { p_token: string }; Returns: boolean }
      claim_admin: { Args: never; Returns: boolean }
      confirm_attendance: { Args: { p_token: string }; Returns: string }
      confirm_free_hold: {
        Args: { p_id: string; p_secret: string }
        Returns: string
      }
      consume_sketch_quota: {
        Args: { p_key: string; p_limit: number }
        Returns: boolean
      }
      create_pending_appointment: {
        Args: {
          p_date: string
          p_email: string
          p_name: string
          p_phone: string
          p_pronouns: string
          p_time_slot: string
        }
        Returns: {
          hold_secret: string
          id: string
        }[]
      }
      gen_access_token: { Args: never; Returns: string }
      get_booking_by_token: {
        Args: { p_token: string }
        Returns: {
          booking_date: string
          client_name: string
          created_at: string
          email: string
          id: string
          phone: string
          pronouns: string
          reschedule_count: number
          rescheduled_at: string
          status: string
          time_slot: string
        }[]
      }
      get_booking_confirmation: {
        Args: { p_token: string }
        Returns: {
          client_confirmed_at: string
          reminder_sent_at: string
        }[]
      }
      get_booking_status: { Args: { p_id: string }; Returns: string }
      get_booking_token: { Args: { p_id: string; p_secret: string }; Returns: string }
      get_confirmed_booking: {
        Args: { p_id: string }
        Returns: {
          booking_date: string
          client_name: string
          created_at: string
          email: string
          id: string
          phone: string
          pronouns: string
          status: string
          time_slot: string
        }[]
      }
      get_hold_for_checkout: {
        Args: { p_id: string; p_secret: string }
        Returns: {
          booking_date: string
          client_name: string
          email: string
          hold_expires_at: string
          status: string
          time_slot: string
        }[]
      }
      get_unavailable_slots: {
        Args: { p_from: string; p_to: string }
        Returns: {
          kind: string
          slot_date: string
          time_slot: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      release_pending_appointment: {
        Args: { p_id: string }
        Returns: undefined
      }
      reschedule_booking: {
        Args: { p_date: string; p_time_slot: string; p_token: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const

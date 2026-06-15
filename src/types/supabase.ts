export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      arrival_verifications: {
        Row: {
          created_at: string;
          destination_id: string;
          id: string;
          method: Database["public"]["Enums"]["verification_method"];
          status: Database["public"]["Enums"]["verification_status"];
          trip_id: string;
          verified_at: string | null;
          verified_by: string;
        };
        Insert: {
          created_at?: string;
          destination_id: string;
          id?: string;
          method: Database["public"]["Enums"]["verification_method"];
          status?: Database["public"]["Enums"]["verification_status"];
          trip_id: string;
          verified_at?: string | null;
          verified_by: string;
        };
        Update: {
          created_at?: string;
          destination_id?: string;
          id?: string;
          method?: Database["public"]["Enums"]["verification_method"];
          status?: Database["public"]["Enums"]["verification_status"];
          trip_id?: string;
          verified_at?: string | null;
          verified_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "arrival_verifications_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "arrival_verifications_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "arrival_verifications_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      connection_invites: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          inviter_id: string;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          status: Database["public"]["Enums"]["invite_status"];
          token_hash: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          inviter_id: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          status?: Database["public"]["Enums"]["invite_status"];
          token_hash: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          inviter_id?: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          status?: Database["public"]["Enums"]["invite_status"];
          token_hash?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connection_invites_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connection_invites_inviter_id_fkey";
            columns: ["inviter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      destinations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          qr_token: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
          qr_token?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          qr_token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "destinations_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      help_requests: {
        Row: {
          acknowledged_at: string | null;
          acknowledged_by: string | null;
          created_at: string;
          id: string;
          requested_by: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["help_request_status"];
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          id?: string;
          requested_by: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["help_request_status"];
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          created_at?: string;
          id?: string;
          requested_by?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["help_request_status"];
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "help_requests_acknowledged_by_fkey";
            columns: ["acknowledged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "help_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "help_requests_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_events: {
        Row: {
          actor_id: string | null;
          created_at: string;
          delivered_at: string | null;
          delivery_status: Database["public"]["Enums"]["notification_delivery_status"];
          id: string;
          payload: Json;
          recipient_id: string;
          trip_id: string | null;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          delivered_at?: string | null;
          delivery_status?: Database["public"]["Enums"]["notification_delivery_status"];
          id?: string;
          payload?: Json;
          recipient_id: string;
          trip_id?: string | null;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          delivered_at?: string | null;
          delivery_status?: Database["public"]["Enums"]["notification_delivery_status"];
          id?: string;
          payload?: Json;
          recipient_id?: string;
          trip_id?: string | null;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Relationships: [
          {
            foreignKeyName: "notification_events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_events_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_events_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
          permissions_seen: boolean;
          permissions_seen_at: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          permissions_seen?: boolean;
          permissions_seen_at?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          permissions_seen?: boolean;
          permissions_seen_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      relationships: {
        Row: {
          created_at: string;
          id: string;
          recipient_id: string;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          requester_id: string;
          status: Database["public"]["Enums"]["relationship_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          recipient_id: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          requester_id: string;
          status?: Database["public"]["Enums"]["relationship_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          recipient_id?: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          requester_id?: string;
          status?: Database["public"]["Enums"]["relationship_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "relationships_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "relationships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      time_extension_requests: {
        Row: {
          created_at: string;
          id: string;
          previous_expected_arrival_at: string;
          requested_by: string;
          requested_expected_arrival_at: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["request_status"];
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          previous_expected_arrival_at: string;
          requested_by: string;
          requested_expected_arrival_at: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["request_status"];
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          previous_expected_arrival_at?: string;
          requested_by?: string;
          requested_expected_arrival_at?: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["request_status"];
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_extension_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "time_extension_requests_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_recipients: {
        Row: {
          added_by: string;
          created_at: string;
          id: string;
          notification_enabled: boolean;
          recipient_id: string;
          relationship_id: string;
          trip_id: string;
        };
        Insert: {
          added_by: string;
          created_at?: string;
          id?: string;
          notification_enabled?: boolean;
          recipient_id: string;
          relationship_id: string;
          trip_id: string;
        };
        Update: {
          added_by?: string;
          created_at?: string;
          id?: string;
          notification_enabled?: boolean;
          recipient_id?: string;
          relationship_id?: string;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_recipients_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_recipients_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_recipients_relationship_id_fkey";
            columns: ["relationship_id"];
            isOneToOne: false;
            referencedRelation: "relationships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_recipients_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trips: {
        Row: {
          arrived_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          destination_id: string;
          expected_arrival_at: string;
          id: string;
          owner_id: string;
          started_at: string | null;
          state: Database["public"]["Enums"]["app_state"];
          updated_at: string;
        };
        Insert: {
          arrived_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          destination_id: string;
          expected_arrival_at: string;
          id?: string;
          owner_id: string;
          started_at?: string | null;
          state?: Database["public"]["Enums"]["app_state"];
          updated_at?: string;
        };
        Update: {
          arrived_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          destination_id?: string;
          expected_arrival_at?: string;
          id?: string;
          owner_id?: string;
          started_at?: string | null;
          state?: Database["public"]["Enums"]["app_state"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trips_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trips_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_connection_invite: {
        Args: { invite_token: string };
        Returns: {
          invite_id: string;
          relationship_id: string;
        }[];
      };
      is_accepted_relationship_between: {
        Args: {
          input_relationship_id: string;
          input_user_a: string;
          input_user_b: string;
        };
        Returns: boolean;
      };
      is_trip_owner: {
        Args: { input_trip_id: string };
        Returns: boolean;
      };
      is_trip_participant: {
        Args: { input_trip_id: string };
        Returns: boolean;
      };
      is_valid_notification_payload: {
        Args: { input_payload: Json };
        Returns: boolean;
      };
      is_valid_trip_recipient: {
        Args: {
          input_recipient_id: string;
          input_relationship_id: string;
          input_trip_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_state:
        | "not_started"
        | "on_the_way"
        | "arrived_verified"
        | "arrived_partial"
        | "late"
        | "extension_requested"
        | "emergency_requested"
        | "cancelled";
      help_request_status: "requested" | "acknowledged" | "resolved" | "cancelled";
      invite_status: "pending" | "accepted" | "expired" | "cancelled";
      notification_delivery_status:
        | "recorded"
        | "queued"
        | "sent"
        | "failed"
        | "skipped";
      notification_type:
        | "trip_started"
        | "trip_late"
        | "arrived_partial"
        | "arrived_verified"
        | "time_extension_requested"
        | "time_extension_accepted"
        | "time_extension_declined"
        | "help_requested"
        | "trip_cancelled";
      relationship_status: "pending" | "accepted" | "declined" | "cancelled" | "blocked";
      relationship_type: "friend" | "partner" | "family" | "sibling" | "other";
      request_status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
      verification_method: "qr_code" | "location";
      verification_status: "pending" | "succeeded" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_state: [
        "not_started",
        "on_the_way",
        "arrived_verified",
        "arrived_partial",
        "late",
        "extension_requested",
        "emergency_requested",
        "cancelled",
      ],
      help_request_status: ["requested", "acknowledged", "resolved", "cancelled"],
      invite_status: ["pending", "accepted", "expired", "cancelled"],
      notification_delivery_status: ["recorded", "queued", "sent", "failed", "skipped"],
      notification_type: [
        "trip_started",
        "trip_late",
        "arrived_partial",
        "arrived_verified",
        "time_extension_requested",
        "time_extension_accepted",
        "time_extension_declined",
        "help_requested",
        "trip_cancelled",
      ],
      relationship_status: ["pending", "accepted", "declined", "cancelled", "blocked"],
      relationship_type: ["friend", "partner", "family", "sibling", "other"],
      request_status: ["pending", "accepted", "declined", "cancelled", "expired"],
      verification_method: ["qr_code", "location"],
      verification_status: ["pending", "succeeded", "failed"],
    },
  },
} as const;

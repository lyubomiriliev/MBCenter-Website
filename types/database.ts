// Database types for Supabase
// To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "mechanic" | "reception";
export type OfferStatus =
  | "draft"
  | "sent"
  | "parts_ordered"
  | "finished"
  | "cancelled";
export type OfferItemType = "part" | "labor";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_id: string;
          role: UserRole;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          client_id: string | null;
          model: string;
          year: number | null;
          vin: string | null;
          license_plate: string | null;
          mileage: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          model: string;
          year?: number | null;
          vin?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          model?: string;
          year?: number | null;
          vin?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          created_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          offer_number: string;
          client_id: string | null;
          car_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          car_model_text: string | null;
          car_model_detail: string | null;
          repair_name: string | null;
          vin_text: string | null;
          license_plate: string | null;
          mileage: number | null;
          mileage_unit: string;
          car_year: number | null;
          created_by_name: string | null;
          status: OfferStatus;
          total_net: number;
          total_vat: number;
          total_gross: number;
          discount_percent: number;
          discount_parts_percent: number;
          discount_services_percent: number;
          currency: string;
          notes: string | null;
          notes_internal: string | null;
          notes_service: string | null;
          service_card_number: string | null;
          service_card_generated_at: string | null;
          performed_by: string | null;
          prepayments_eur: number[] | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          assyst_remaining_time: string | null;
          assyst_remaining_mileage: string | null;
          assyst_service_code: string | null;
          assyst_service_description: string | null;
          assyst_mileage_unit: string | null;
        };
        Insert: {
          id?: string;
          offer_number: string;
          client_id?: string | null;
          car_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          car_model_text?: string | null;
          car_model_detail?: string | null;
          repair_name?: string | null;
          vin_text?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          mileage_unit?: string;
          car_year?: number | null;
          created_by_name?: string | null;
          status?: OfferStatus;
          total_net?: number;
          total_vat?: number;
          total_gross?: number;
          discount_percent?: number;
          discount_parts_percent?: number;
          discount_services_percent?: number;
          currency?: string;
          notes?: string | null;
          notes_internal?: string | null;
          notes_service?: string | null;
          service_card_number?: string | null;
          service_card_generated_at?: string | null;
          performed_by?: string | null;
          prepayments_eur?: number[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          assyst_remaining_time?: string | null;
          assyst_remaining_mileage?: string | null;
          assyst_service_code?: string | null;
          assyst_service_description?: string | null;
          assyst_mileage_unit?: string | null;
        };
        Update: {
          id?: string;
          offer_number?: string;
          client_id?: string | null;
          car_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          car_model_text?: string | null;
          car_model_detail?: string | null;
          repair_name?: string | null;
          vin_text?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          mileage_unit?: string;
          car_year?: number | null;
          created_by_name?: string | null;
          status?: OfferStatus;
          total_net?: number;
          total_vat?: number;
          total_gross?: number;
          discount_percent?: number;
          discount_parts_percent?: number;
          discount_services_percent?: number;
          currency?: string;
          notes?: string | null;
          notes_internal?: string | null;
          notes_service?: string | null;
          service_card_number?: string | null;
          service_card_generated_at?: string | null;
          performed_by?: string | null;
          prepayments_eur?: number[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          assyst_remaining_time?: string | null;
          assyst_remaining_mileage?: string | null;
          assyst_service_code?: string | null;
          assyst_service_description?: string | null;
          assyst_mileage_unit?: string | null;
        };
      };
      offer_items: {
        Row: {
          id: string;
          offer_id: string;
          type: OfferItemType;
          description: string;
          brand: string | null;
          part_number: string | null;
          unit_price: number;
          quantity: number;
          total: number;
          sort_order: number;
          cost_price: number | null;
        };
        Insert: {
          id?: string;
          offer_id: string;
          type: OfferItemType;
          description: string;
          brand?: string | null;
          part_number?: string | null;
          unit_price: number;
          quantity?: number;
          total: number;
          sort_order?: number;
          cost_price?: number | null;
        };
        Update: {
          id?: string;
          offer_id?: string;
          type?: OfferItemType;
          description?: string;
          brand?: string | null;
          part_number?: string | null;
          unit_price?: number;
          quantity?: number;
          total?: number;
          sort_order?: number;
          cost_price?: number | null;
        };
      };
      service_actions: {
        Row: {
          id: string;
          offer_id: string;
          action_name: string;
          time_required_text: string | null;
          price_per_hour_eur_net: number;
          total_eur_net: number;
          is_fixed_price: boolean;
          fixed_price_amount: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          action_name: string;
          time_required_text?: string | null;
          price_per_hour_eur_net: number;
          total_eur_net: number;
          is_fixed_price?: boolean;
          fixed_price_amount?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          action_name?: string;
          time_required_text?: string | null;
          price_per_hour_eur_net?: number;
          total_eur_net?: number;
          is_fixed_price?: boolean;
          fixed_price_amount?: number | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      offer_payments: {
        Row: {
          id: string;
          offer_id: string;
          amount_eur_net: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          amount_eur_net: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          amount_eur_net?: number;
          note?: string | null;
          created_at?: string;
        };
      };
      fixed_activities: {
        Row: {
          id: string;
          name: string;
          price_eur: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price_eur: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_eur?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      hourly_activities: {
        Row: {
          id: string;
          name: string;
          price_per_hour_eur: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price_per_hour_eur: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_per_hour_eur?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      mechanics: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      receptionists: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      earnings_entries: {
        Row: {
          id: string;
          worker_id: string;
          worker_type: 'mechanic' | 'receptionist';
          worker_name: string;
          vehicle: string | null;
          repair_name: string | null;
          repair_time: number | null;
          hourly_rate: number | null;
          total: number | null;
          repair_total: number | null;
          turnover_pct: number | null;
          earnings: number | null;
          entry_date: string;
          month: number;
          year: number;
          offer_id: string | null;
          offer_number: string | null;
          created_at: string;
          is_exported: boolean;
        };
        Insert: {
          id?: string;
          worker_id: string;
          worker_type: 'mechanic' | 'receptionist';
          worker_name: string;
          vehicle?: string | null;
          repair_name?: string | null;
          repair_time?: number | null;
          hourly_rate?: number | null;
          total?: number | null;
          repair_total?: number | null;
          turnover_pct?: number | null;
          earnings?: number | null;
          entry_date?: string;
          month: number;
          year: number;
          offer_id?: string | null;
          offer_number?: string | null;
          created_at?: string;
          is_exported?: boolean;
        };
        Update: {
          id?: string;
          worker_id?: string;
          worker_type?: 'mechanic' | 'receptionist';
          worker_name?: string;
          vehicle?: string | null;
          repair_name?: string | null;
          repair_time?: number | null;
          hourly_rate?: number | null;
          total?: number | null;
          repair_total?: number | null;
          turnover_pct?: number | null;
          earnings?: number | null;
          entry_date?: string;
          month?: number;
          year?: number;
          offer_id?: string | null;
          offer_number?: string | null;
          created_at?: string;
          is_exported?: boolean;
        };
      };
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      earnings_monthly_summary: {
        Row: {
          id: string;
          worker_id: string;
          worker_type: 'mechanic' | 'receptionist';
          month: number;
          year: number;
          card_amount: number;
          fines_amount: number;
          bonus_amount: number;
          fixed_salary: number;
          cash_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          worker_type: 'mechanic' | 'receptionist';
          month: number;
          year: number;
          card_amount?: number;
          fines_amount?: number;
          bonus_amount?: number;
          fixed_salary?: number;
          cash_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          worker_type?: 'mechanic' | 'receptionist';
          month?: number;
          year?: number;
          card_amount?: number;
          fines_amount?: number;
          bonus_amount?: number;
          fixed_salary?: number;
          cash_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_offer_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      offer_status: OfferStatus; // NOTE: DB migration needed to add 'parts_ordered' and remove 'approved'
      offer_item_type: OfferItemType;
    };
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type Offer = Database["public"]["Tables"]["offers"]["Row"];
export type OfferItem = Database["public"]["Tables"]["offer_items"]["Row"];
export type ServiceAction =
  Database["public"]["Tables"]["service_actions"]["Row"];
export type OfferPayment =
  Database["public"]["Tables"]["offer_payments"]["Row"];
export type FixedActivity =
  Database["public"]["Tables"]["fixed_activities"]["Row"];
export type HourlyActivity =
  Database["public"]["Tables"]["hourly_activities"]["Row"];
export type Mechanic = Database["public"]["Tables"]["mechanics"]["Row"];
export type Receptionist = Database["public"]["Tables"]["receptionists"]["Row"];
export type AppSettings = Database["public"]["Tables"]["app_settings"]["Row"];
export type EarningsEntry = Database["public"]["Tables"]["earnings_entries"]["Row"];
export type EarningsMonthlySummary = Database["public"]["Tables"]["earnings_monthly_summary"]["Row"];

export type InsertProfile = Database["public"]["Tables"]["profiles"]["Insert"];
export type InsertClient = Database["public"]["Tables"]["clients"]["Insert"];
export type InsertCar = Database["public"]["Tables"]["cars"]["Insert"];
export type InsertOffer = Database["public"]["Tables"]["offers"]["Insert"];
export type InsertOfferItem =
  Database["public"]["Tables"]["offer_items"]["Insert"];
export type InsertServiceAction =
  Database["public"]["Tables"]["service_actions"]["Insert"];
export type InsertOfferPayment =
  Database["public"]["Tables"]["offer_payments"]["Insert"];
export type InsertFixedActivity =
  Database["public"]["Tables"]["fixed_activities"]["Insert"];
export type InsertHourlyActivity =
  Database["public"]["Tables"]["hourly_activities"]["Insert"];
export type InsertAppSettings =
  Database["public"]["Tables"]["app_settings"]["Insert"];
export type InsertEarningsEntry =
  Database["public"]["Tables"]["earnings_entries"]["Insert"];
export type InsertEarningsMonthlySummary =
  Database["public"]["Tables"]["earnings_monthly_summary"]["Insert"];

export type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"];
export type UpdateClient = Database["public"]["Tables"]["clients"]["Update"];
export type UpdateCar = Database["public"]["Tables"]["cars"]["Update"];
export type UpdateOffer = Database["public"]["Tables"]["offers"]["Update"];
export type UpdateOfferItem =
  Database["public"]["Tables"]["offer_items"]["Update"];
export type UpdateServiceAction =
  Database["public"]["Tables"]["service_actions"]["Update"];
export type UpdateOfferPayment =
  Database["public"]["Tables"]["offer_payments"]["Update"];
export type UpdateFixedActivity =
  Database["public"]["Tables"]["fixed_activities"]["Update"];

// Extended types with relations
export interface OfferWithRelations extends Offer {
  client?: Client | null;
  car?: Car | null;
  created_by_profile?: Profile | null;
  items?: OfferItem[];
  service_actions?: ServiceAction[];
  payments?: OfferPayment[];
}

export interface CarWithClient extends Car {
  client?: Client | null;
}

export interface WarehousePart {
  id: string;
  name: string;
  part_number: string;
  manufacturer: string;
  quantity: number;
  cost_price: number;
  sale_price: number;
  replaced_by: string | null;
  created_at: string;
  updated_at: string;
}
export type WarehousePartInsert = Omit<WarehousePart, 'id' | 'created_at' | 'updated_at'>;
export type WarehousePartUpdate = Partial<WarehousePartInsert>;

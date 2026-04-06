-- Migration: Add ASSYST PLUS fields to offers table
-- Run this in Supabase SQL Editor

ALTER TABLE offers ADD COLUMN IF NOT EXISTS assyst_remaining_time text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS assyst_remaining_mileage text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS assyst_service_code text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS assyst_service_description text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS assyst_mileage_unit text DEFAULT 'km';

-- Migration: Update updated_at trigger to skip notes-only updates
-- This prevents quote note saves from appearing as offer changes in the log.
-- The trigger is replaced with a version that only bumps updated_at when
-- non-notes fields change.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only bump updated_at if a non-notes field has changed
  IF (
    NEW.offer_number IS DISTINCT FROM OLD.offer_number OR
    NEW.client_id IS DISTINCT FROM OLD.client_id OR
    NEW.car_id IS DISTINCT FROM OLD.car_id OR
    NEW.customer_name IS DISTINCT FROM OLD.customer_name OR
    NEW.customer_phone IS DISTINCT FROM OLD.customer_phone OR
    NEW.customer_email IS DISTINCT FROM OLD.customer_email OR
    NEW.car_model_text IS DISTINCT FROM OLD.car_model_text OR
    NEW.car_model_detail IS DISTINCT FROM OLD.car_model_detail OR
    NEW.repair_name IS DISTINCT FROM OLD.repair_name OR
    NEW.vin_text IS DISTINCT FROM OLD.vin_text OR
    NEW.license_plate IS DISTINCT FROM OLD.license_plate OR
    NEW.mileage IS DISTINCT FROM OLD.mileage OR
    NEW.mileage_unit IS DISTINCT FROM OLD.mileage_unit OR
    NEW.car_year IS DISTINCT FROM OLD.car_year OR
    NEW.created_by_name IS DISTINCT FROM OLD.created_by_name OR
    NEW.status IS DISTINCT FROM OLD.status OR
    NEW.total_net IS DISTINCT FROM OLD.total_net OR
    NEW.total_vat IS DISTINCT FROM OLD.total_vat OR
    NEW.total_gross IS DISTINCT FROM OLD.total_gross OR
    NEW.discount_percent IS DISTINCT FROM OLD.discount_percent OR
    NEW.discount_parts_percent IS DISTINCT FROM OLD.discount_parts_percent OR
    NEW.discount_services_percent IS DISTINCT FROM OLD.discount_services_percent OR
    NEW.currency IS DISTINCT FROM OLD.currency OR
    NEW.service_card_number IS DISTINCT FROM OLD.service_card_number OR
    NEW.service_card_generated_at IS DISTINCT FROM OLD.service_card_generated_at OR
    NEW.performed_by IS DISTINCT FROM OLD.performed_by OR
    NEW.prepayments_eur IS DISTINCT FROM OLD.prepayments_eur OR
    NEW.assyst_remaining_time IS DISTINCT FROM OLD.assyst_remaining_time OR
    NEW.assyst_remaining_mileage IS DISTINCT FROM OLD.assyst_remaining_mileage OR
    NEW.assyst_service_code IS DISTINCT FROM OLD.assyst_service_code OR
    NEW.assyst_service_description IS DISTINCT FROM OLD.assyst_service_description OR
    NEW.assyst_mileage_unit IS DISTINCT FROM OLD.assyst_mileage_unit
  ) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

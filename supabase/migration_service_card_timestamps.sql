-- Migration: Fix timestamp behavior for service card creation
-- Run this in Supabase SQL Editor
--
-- Changes:
-- 1. Offers trigger: service_card_number / service_card_generated_at changes
--    no longer bump updated_at (only real offer field edits should).
-- 2. Warehouse trigger: replaced with a caller-controlled pattern.
--    - Manual edits (useUpdateWarehousePart) explicitly set updated_at = NOW()
--      in the UPDATE payload → trigger detects the change and keeps it.
--    - Automatic stock deductions pass back the existing updated_at value
--      → trigger detects no change and leaves the timestamp alone.

-- ── 1. Offers updated_at trigger ──────────────────────────────────────────
-- Removed service_card_number and service_card_generated_at from the list of
-- fields that cause updated_at to be bumped.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
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
    NEW.total_net IS DISTINCT FROM OLD.total_net OR
    NEW.total_vat IS DISTINCT FROM OLD.total_vat OR
    NEW.total_gross IS DISTINCT FROM OLD.total_gross OR
    NEW.discount_percent IS DISTINCT FROM OLD.discount_percent OR
    NEW.discount_parts_percent IS DISTINCT FROM OLD.discount_parts_percent OR
    NEW.discount_services_percent IS DISTINCT FROM OLD.discount_services_percent OR
    NEW.currency IS DISTINCT FROM OLD.currency OR
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

-- ── 2. Warehouse parts updated_at trigger ─────────────────────────────────
-- The trigger now trusts the caller to signal whether updated_at should change:
--
--   • Manual edits (useUpdateWarehousePart hook):
--       pass updated_at = NOW() explicitly → NEW.updated_at != OLD.updated_at
--       → trigger keeps the caller-supplied value (already correct).
--
--   • Automatic stock deductions (service card creation):
--       pass updated_at = <existing value> → NEW.updated_at = OLD.updated_at
--       → trigger detects no change and leaves the timestamp alone.
--
-- The old trigger unconditionally set updated_at = now() on every UPDATE,
-- which caused automatic deductions to bump the displayed timestamp.

CREATE OR REPLACE FUNCTION update_warehouse_parts_updated_at()
RETURNS trigger AS $$
BEGIN
  -- Only update the timestamp when the caller has explicitly changed it
  -- (i.e. a manual edit that passed updated_at = NOW()).
  -- If the caller passed back the existing value (automatic deduction),
  -- leave updated_at untouched so the displayed date is preserved.
  IF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
    -- Caller already set an explicit new timestamp; honour it as-is.
    RETURN NEW;
  END IF;
  -- Timestamp unchanged by caller — this is an automatic system operation.
  -- Keep the old updated_at value.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

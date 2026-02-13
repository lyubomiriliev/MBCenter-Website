-- Add mileage_unit field to offers table (default 'km')
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS mileage_unit VARCHAR(10) DEFAULT 'km';

-- Add service_card_number and service_card_generated_at fields to track service card generation
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS service_card_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS service_card_generated_at TIMESTAMPTZ;

-- Update existing offers to have 'km' as default mileage unit
UPDATE offers SET mileage_unit = 'km' WHERE mileage_unit IS NULL;

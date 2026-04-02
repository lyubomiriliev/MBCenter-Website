-- Add car_model_detail column to inspections table
-- car_model stores the Mercedes model name (e.g. "A-Class (W176)")
-- car_model_detail stores the exact free-text model (e.g. "180d AMG Line")

alter table inspections
  add column if not exists car_model_detail text;

-- Denormalize email, license_plate, mileage, car_year on offers for edit pre-fill
alter table offers add column if not exists customer_email text;
alter table offers add column if not exists license_plate text;
alter table offers add column if not exists mileage int;
alter table offers add column if not exists car_year int;

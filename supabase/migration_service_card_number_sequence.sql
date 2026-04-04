-- Add a sequential service card number separate from offer numbers
-- Service card numbers start at 20240 and are zero-padded to 8 digits (e.g. 00020240)

create sequence if not exists service_card_seq start 20240;

create or replace function generate_service_card_number()
returns text as $$
begin
  return lpad(nextval('service_card_seq')::text, 8, '0');
end;
$$ language plpgsql;

alter table offer_items
  add column if not exists cost_price numeric(10,2) default null;

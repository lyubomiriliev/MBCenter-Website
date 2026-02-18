-- Store advance payments (prepayments) per offer as array of EUR amounts
ALTER TABLE offers ADD COLUMN IF NOT EXISTS prepayments_eur numeric[] DEFAULT '{}';

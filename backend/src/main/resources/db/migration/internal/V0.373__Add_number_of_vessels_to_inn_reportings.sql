-- Backfill numberOfVessels = 1 in JSONB value for existing INN InfractionSuspicion reportings.
-- Rows that already have a "numberOfVessels" key are skipped (idempotent).
UPDATE reportings
SET value = jsonb_set(value, '{numberOfVessels}', '1'::jsonb)
WHERE is_iuu = true
  AND NOT (value ? 'numberOfVessels');

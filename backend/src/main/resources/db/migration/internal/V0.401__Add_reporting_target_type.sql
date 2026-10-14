CREATE TYPE reporting_target_type AS ENUM ('VESSEL', 'GEAR');

ALTER TABLE reportings ADD COLUMN target_type reporting_target_type NOT NULL DEFAULT 'VESSEL';

UPDATE reportings
SET value = jsonb_set(value - 'numberOfVessels', '{numberOfTargets}', value -> 'numberOfVessels')
WHERE value ? 'numberOfVessels';

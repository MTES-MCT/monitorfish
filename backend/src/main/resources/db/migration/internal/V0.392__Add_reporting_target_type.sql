CREATE TYPE public.reporting_target_type AS ENUM ('VESSEL', 'GEAR');

ALTER TABLE reportings ADD COLUMN target_type reporting_target_type NOT NULL DEFAULT 'VESSEL';

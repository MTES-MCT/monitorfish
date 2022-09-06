CREATE TYPE public.vessel_identifier AS ENUM ('INTERNAL_REFERENCE_NUMBER', 'EXTERNAL_REFERENCE_NUMBER', 'IRCS');

ALTER TABLE public.last_positions
    ALTER COLUMN vessel_identifier TYPE vessel_identifier USING vessel_identifier::vessel_identifier;

ALTER TABLE public.last_positions
    ALTER COLUMN vessel_identifier SET NOT NULL;

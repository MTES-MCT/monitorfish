ALTER TABLE public.beacon_statuses
    ALTER COLUMN vessel_identifier TYPE vessel_identifier USING vessel_identifier::vessel_identifier;

ALTER TABLE public.beacon_statuses
    ALTER COLUMN vessel_identifier SET NOT NULL;

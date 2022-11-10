ALTER TABLE public.beacons
    ALTER COLUMN vessel_id
    DROP NOT NULL;

ALTER TABLE public.beacons
    ADD COLUMN beacon_type VARCHAR,
    ADD COLUMN is_coastal BOOLEAN;
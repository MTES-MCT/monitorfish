ALTER TABLE public.vessels
    DROP COLUMN beacon_number,
    DROP COLUMN beacon_status,
    DROP COLUMN satellite_operator_id;

CREATE INDEX ON public.vessels (id);

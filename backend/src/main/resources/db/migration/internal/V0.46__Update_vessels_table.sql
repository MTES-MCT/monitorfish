ALTER TABLE public.vessels
    ADD COLUMN beacon_number VARCHAR(100);

CREATE INDEX ON public.vessels (beacon_number);
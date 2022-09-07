ALTER TABLE public.last_positions
    ADD COLUMN estimated_current_latitude DOUBLE PRECISION,
    ADD COLUMN estimated_current_longitude DOUBLE PRECISION;

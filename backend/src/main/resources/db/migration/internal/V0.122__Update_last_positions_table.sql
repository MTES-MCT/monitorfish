ALTER TABLE public.last_positions
    ADD COLUMN beacon_malfunction_id integer,
    ADD COLUMN is_manual BOOLEAN;
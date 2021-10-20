ALTER TABLE public.vessels
    ADD COLUMN under_charter BOOLEAN;

ALTER TABLE public.last_positions
    ADD COLUMN under_charter BOOLEAN;

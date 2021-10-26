ALTER TABLE public.last_positions
    ADD COLUMN is_at_port BOOLEAN NOT NULL DEFAULT false;
-- Delete all rows to add column with NOT NULL constraint and no default value
DELETE FROM public.last_positions;

ALTER TABLE public.last_positions
    ADD COLUMN position_id INTEGER UNIQUE NOT NULL,
    ADD COLUMN is_at_port BOOLEAN NOT NULL DEFAULT false;
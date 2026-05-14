CREATE TYPE public.position_type AS ENUM ('AIS', 'VMS');

ALTER TABLE public.last_positions
    ADD COLUMN position_type position_type NOT NULL DEFAULT 'VMS';

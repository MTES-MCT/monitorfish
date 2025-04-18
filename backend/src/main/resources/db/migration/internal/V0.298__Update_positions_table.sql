ALTER TABLE public.positions
DROP COLUMN time_since_previous_position;

ALTER TABLE public.positions
ADD COLUMN time_since_previous_position DOUBLE PRECISION;

ALTER TABLE public.positions
DROP COLUMN time_emitting_at_sea;

ALTER TABLE public.positions
ADD COLUMN time_emitting_at_sea DOUBLE PRECISION;
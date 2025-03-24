ALTER TABLE public.positions
ALTER COLUMN time_since_previous_position TYPE DOUBLE PRECISION USING EXTRACT(epoch FROM time_since_previous_position) / 3600.0;

ALTER TABLE public.positions
ALTER COLUMN time_emitting_at_sea TYPE DOUBLE PRECISION USING EXTRACT(epoch FROM time_emitting_at_sea) / 3600.0;
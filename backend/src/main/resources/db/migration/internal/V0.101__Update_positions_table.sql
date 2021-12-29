ALTER TABLE public.positions
    ADD COLUMN is_at_port BOOLEAN,
    ADD COLUMN meters_from_previous_position REAL,
    ADD COLUMN time_since_previous_position INTERVAL,
    ADD COLUMN average_speed REAL,
    ADD COLUMN is_fishing BOOLEAN;
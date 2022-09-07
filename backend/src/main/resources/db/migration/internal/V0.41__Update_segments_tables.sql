ALTER TABLE public.fleet_segments
    ADD COLUMN risk_factor DOUBLE PRECISION NOT NULL DEFAULT 1,
    ADD COLUMN control_priority_level DOUBLE PRECISION NOT NULL DEFAULT 1;

ALTER TABLE public.current_segments
    ADD COLUMN probable_segments varchar(50)[],
    ADD COLUMN risk_factor DOUBLE PRECISION NOT NULL DEFAULT 1,
    ADD COLUMN control_priority_level DOUBLE PRECISION NOT NULL DEFAULT 1;

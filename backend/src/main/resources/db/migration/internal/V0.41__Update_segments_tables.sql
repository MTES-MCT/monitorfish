-- Delete all rows to add columns with NOT NULL constraints
DELETE FROM public.fleet_segments;

ALTER TABLE public.fleet_segments
    ADD COLUMN risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN control_priority_level DOUBLE PRECISION NOT NULL;

-- Same on current_segments table
DELETE FROM public.current_segments;

ALTER TABLE public.current_segments
    ADD COLUMN probable_segments varchar(50)[],
    ADD COLUMN risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN control_priority_level DOUBLE PRECISION NOT NULL;

-- Criteria on the PNO as a whole (not on individual catches). An empty array or a NULL
-- value means the rule does not filter on that criterion.
-- Lower bounds are inclusive, upper bounds are exclusive.
ALTER TABLE public.pno_type_rules
    ADD COLUMN facades VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
    ADD COLUMN vessel_department_codes VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
    ADD COLUMN min_vessel_length DOUBLE PRECISION,
    ADD COLUMN max_vessel_length DOUBLE PRECISION,
    ADD COLUMN min_trip_duration_hours DOUBLE PRECISION,
    ADD COLUMN max_trip_duration_hours DOUBLE PRECISION,
    ADD COLUMN has_catches_on_board BOOLEAN;

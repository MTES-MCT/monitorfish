CREATE TABLE public.control_objectives (
    facade TEXT,
    segment VARCHAR(50),
    year INTEGER,
    target_number_of_controls_at_sea INTEGER NOT NULL DEFAULT 0,
    target_number_of_controls_at_port INTEGER NOT NULL DEFAULT 0,
    control_priority_level DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    CONSTRAINT facade_segment_year_pkey PRIMARY KEY (facade, segment, year)
);
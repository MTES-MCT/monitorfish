-- Empty table to add columns with NOT NULL contraints
DELETE FROM public.last_positions;

ALTER TABLE public.last_positions
    ADD COLUMN impact_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN probability_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN detectability_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN risk_factor DOUBLE PRECISION NOT NULL;
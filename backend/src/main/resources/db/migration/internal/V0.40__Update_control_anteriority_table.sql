ALTER TABLE public.control_anteriority
    DROP COLUMN number_controls_last_5_years,
    DROP COLUMN infraction_rate,
    DROP COLUMN diversion_rate,
    DROP COLUMN seizure_rate,
    DROP COLUMN escort_to_quay_rate,
    ADD COLUMN number_recent_controls INTEGER NOT NULL,
    ADD COLUMN control_rate_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN infraction_score DOUBLE PRECISION NOT NULL,
    ADD COLUMN infraction_rate_risk_factor DOUBLE PRECISION NOT NULL;
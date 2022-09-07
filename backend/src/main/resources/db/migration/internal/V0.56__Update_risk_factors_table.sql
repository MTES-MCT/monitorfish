-- The table must be empty in order to add columns with NOT NULL constraints
DELETE FROM risk_factors;

ALTER TABLE risk_factors
    ALTER COLUMN impact_risk_factor SET NOT NULL,
    ALTER COLUMN probability_risk_factor SET NOT NULL,
    ALTER COLUMN detectability_risk_factor SET NOT NULL,
    ALTER COLUMN risk_factor SET NOT NULL,
    ADD COLUMN control_priority_level DOUBLE PRECISION NOT NULL,
    ADD COLUMN control_rate_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN infraction_rate_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN infraction_score DOUBLE PRECISION,
    ADD COLUMN number_controls_last_3_years SMALLINT NOT NULL,
    ADD COLUMN number_controls_last_5_years SMALLINT NOT NULL,
    ADD COLUMN number_diversions_last_5_years SMALLINT NOT NULL,
    ADD COLUMN number_escorts_to_quay_last_5_years SMALLINT NOT NULL,
    ADD COLUMN number_infractions_last_5_years SMALLINT NOT NULL,
    ADD COLUMN number_recent_controls SMALLINT NOT NULL,
    ADD COLUMN number_seizures_last_5_years SMALLINT NOT NULL,
    ADD COLUMN segment_highest_impact VARCHAR(100),
    ADD COLUMN segment_highest_priority VARCHAR(100),
    ADD COLUMN vessel_id INTEGER;
-- The table must be empty in order to add columns with NOT NULL constraints
DELETE FROM risk_factors;

ALTER TABLE risk_factors
    ADD COLUMN recent_gear_onboard JSONB,
    ADD COLUMN recent_segments varchar(100)[],
    ADD COLUMN recent_segments_impact_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segments_detectability_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segments_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segments_control_priority_level DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segment_highest_impact VARCHAR(100),
    ADD COLUMN recent_segment_highest_priority VARCHAR(100),
    ADD COLUMN usual_gear_onboard JSONB,
    ADD COLUMN usual_segments varchar(100)[],
    ADD COLUMN usual_segments_impact_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN usual_segments_detectability_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN usual_segments_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN usual_segments_control_priority_level DOUBLE PRECISION NOT NULL,
    ADD COLUMN usual_segment_highest_impact VARCHAR(100),
    ADD COLUMN usual_segment_highest_priority VARCHAR(100);

ALTER TABLE risk_factors
    ADD COLUMN recent_gears JSONB,
    ADD COLUMN recent_segments varchar(100)[],
    ADD COLUMN recent_segments_impact_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segments_detectability_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segments_risk_factor DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segments_control_priority_level DOUBLE PRECISION NOT NULL,
    ADD COLUMN recent_segment_highest_impact VARCHAR(100),
    ADD COLUMN recent_segment_highest_priority VARCHAR(100);

ALTER TABLE public.risk_factors
    ADD COLUMN recent_segments_probability_risk_factor DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    ADD COLUMN usual_segments_probability_risk_factor DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    ADD COLUMN infringement_risk_level DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    ADD COLUMN segment_highest_infringement_risk VARCHAR(100),
    ADD COLUMN recent_segments_infringement_risk_level DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    ADD COLUMN recent_segment_highest_infringement_risk VARCHAR(100),
    ADD COLUMN usual_segments_infringement_risk_level DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    ADD COLUMN usual_segment_highest_infringement_risk VARCHAR(100);

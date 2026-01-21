ALTER TABLE public.current_segments
    ADD COLUMN infringement_risk_level DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    ADD COLUMN segment_highest_infringement_risk VARCHAR(100);

ALTER TABLE public.fleet_segments
    RENAME COLUMN risk_factor to impact_risk_factor;

ALTER TABLE public.current_segments
    RENAME COLUMN risk_factor to impact_risk_factor;
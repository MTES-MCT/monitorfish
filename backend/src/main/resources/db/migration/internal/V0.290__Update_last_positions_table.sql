ALTER TABLE public.last_positions
    ALTER COLUMN longitude SET NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN latitude SET NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN total_weight_onboard SET NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN impact_risk_factor SET NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN probability_risk_factor SET NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN detectability_risk_factor SET NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN risk_factor SET NOT NULL;

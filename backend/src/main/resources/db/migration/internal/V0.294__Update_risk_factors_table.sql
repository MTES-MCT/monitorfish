ALTER TABLE public.risk_factors
    ADD COLUMN id SERIAL;

CREATE INDEX ON public.risk_factors (vessel_id);

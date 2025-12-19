ALTER TABLE public.risk_factors
ADD COLUMN has_current_vms_fishing_activity BOOLEAN NOT NULL DEFAULT false;

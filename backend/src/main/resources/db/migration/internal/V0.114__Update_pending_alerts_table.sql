DELETE FROM public.pending_alerts;
ALTER TABLE public.pending_alerts ADD COLUMN vessel_identifier vessel_identifier NOT NULL;
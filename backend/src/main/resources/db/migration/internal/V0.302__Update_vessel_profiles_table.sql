ALTER TABLE public.vessel_profiles
ADD COLUMN recent_gear_onboard JSONB,
ADD COLUMN gear_onboard JSONB;

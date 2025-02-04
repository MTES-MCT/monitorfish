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
    ALTER COLUMN risk_factor SET NOT NULL;

ALTER TABLE public.risk_factors
    ALTER COLUMN gear_onboard SET NOT NULL;
ALTER TABLE public.risk_factors
    ALTER COLUMN species_onboard SET NOT NULL;

ALTER TABLE public.vessels
    ALTER COLUMN declared_fishing_gears SET NOT NULL;

ALTER TABLE public.logbook_reports
    ALTER COLUMN operation_type SET NOT NULL;
ALTER TABLE public.logbook_reports
    ALTER COLUMN integration_datetime_utc SET NOT NULL;

ALTER TYPE public.logbook_message_transmission_format ADD VALUE 'MANUAL' AFTER 'FLUX';

ALTER TABLE public.logbook_reports
    ALTER COLUMN transmission_format SET NOT NULL;

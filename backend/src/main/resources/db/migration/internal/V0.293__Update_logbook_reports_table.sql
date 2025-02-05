ALTER TABLE public.logbook_reports
    ALTER COLUMN operation_type SET NOT NULL;
ALTER TABLE public.logbook_reports
    ALTER COLUMN integration_datetime_utc SET NOT NULL;
ALTER TABLE public.logbook_reports
    ALTER COLUMN transmission_format SET NOT NULL;

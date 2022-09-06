ALTER TABLE public.alerts
    ALTER COLUMN trip_number TYPE VARCHAR(100);

ALTER TABLE public.pending_alerts
    ALTER COLUMN trip_number TYPE VARCHAR(100);

DELETE
FROM public.pending_alerts;

ALTER TABLE public.pending_alerts
    ADD COLUMN alert_config_name VARCHAR(200);

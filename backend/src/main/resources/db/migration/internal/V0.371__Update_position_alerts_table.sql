ALTER TABLE public.position_alerts
    ADD COLUMN is_deleted_after_validity_period BOOLEAN NOT NULL DEFAULT FALSE;

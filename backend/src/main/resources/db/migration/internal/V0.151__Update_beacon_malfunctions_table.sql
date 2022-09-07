ALTER TABLE public.beacon_malfunctions
    ADD COLUMN vessel_id INTEGER,
    ADD COLUMN notification_requested beacon_malfunction_notification_type,
    ADD COLUMN latitude double precision,
    ADD COLUMN longitude double precision;

CREATE INDEX beacon_malfunctions_notification_requested_idx
ON beacon_malfunctions (notification_requested)
WHERE notification_requested IS NOT NULL;
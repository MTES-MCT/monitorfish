ALTER TABLE public.beacon_malfunctions
    ADD COLUMN vessel_id INTEGER,
    ADD COLUMN notification_requested beacon_malfunction_notification_type;
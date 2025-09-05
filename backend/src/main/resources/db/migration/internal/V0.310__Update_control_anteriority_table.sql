ALTER TABLE public.control_anteriority
    ADD COLUMN last_control_at_sea_datetime_utc TIMESTAMP;

ALTER TABLE public.control_anteriority
    ADD COLUMN last_control_at_quay_datetime_utc TIMESTAMP;

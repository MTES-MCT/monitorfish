ALTER TABLE public.last_positions
    ADD COLUMN last_control_datetime_utc TIMESTAMP,
    ADD COLUMN last_control_infraction BOOLEAN,
    ADD COLUMN post_control_comments TEXT;

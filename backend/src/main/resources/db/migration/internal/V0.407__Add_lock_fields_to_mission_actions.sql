ALTER TABLE public.mission_actions
    ADD COLUMN is_locked BOOLEAN NULL,
    ADD COLUMN last_lock_datetime_utc TIMESTAMP WITH TIME ZONE NULL;

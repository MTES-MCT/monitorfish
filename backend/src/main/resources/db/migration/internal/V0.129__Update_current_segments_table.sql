ALTER TABLE public.current_segments
    RENAME COLUMN last_ers_datetime_utc TO last_logbook_message_datetime_utc;

ALTER TABLE public.current_segments
    ALTER COLUMN trip_number TYPE VARCHAR(100);

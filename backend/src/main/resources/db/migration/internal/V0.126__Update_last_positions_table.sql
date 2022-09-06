ALTER TABLE public.last_positions
    RENAME COLUMN last_ers_datetime_utc TO last_logbook_message_datetime_utc;

ALTER TABLE public.last_positions
    ALTER COLUMN trip_number TYPE VARCHAR(100);

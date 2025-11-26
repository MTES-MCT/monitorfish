ALTER TABLE public.trips_snapshot
RENAME COLUMN sort_order_datetime_utc TO start_activity_datetime_utc;

ALTER TABLE public.trips_snapshot
ADD COLUMN end_activity_datetime_utc TIMESTAMP WITHOUT TIME ZONE;

UPDATE public.trips_snapshot
SET end_activity_datetime_utc = start_activity_datetime_utc;
 
 ALTER TABLE public.trips_snapshot
    ALTER COLUMN start_activity_datetime_utc SET NOT NULL,
    ALTER COLUMN end_activity_datetime_utc SET NOT NULL;
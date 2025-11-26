ALTER TABLE public.trips_snapshot
RENAME COLUMN sort_order_datetime_utc TO start_activity_datetime_utc;

ALTER TABLE public.trips_snapshot
ADD COLUMN end_datetime_utc TIMESTAMP WITHOUT TIME ZONE;
 
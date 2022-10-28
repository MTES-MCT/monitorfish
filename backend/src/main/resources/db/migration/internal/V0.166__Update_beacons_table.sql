DELETE FROM public.beacons;

ALTER TABLE public.beacons 
ADD COLUMN logging_datetime_utc TIMESTAMP NOT NULL;

ALTER TABLE public.beacon_statuses RENAME TO beacon_malfunctions;

ALTER TYPE public.beacon_statuses_vessel_status RENAME TO beacon_malfunctions_vessel_status;
ALTER TYPE public.beacon_statuses_stage RENAME TO beacon_malfunctions_stage;

UPDATE public.beacon_malfunctions
SET
    stage = CAST('END_OF_FOLLOW_UP' AS beacon_malfunctions_stage), 
    vessel_status_last_modification_date_utc = CURRENT_TIMESTAMP
WHERE stage = CAST('RESUMED_TRANSMISSION' AS beacon_malfunctions_stage);

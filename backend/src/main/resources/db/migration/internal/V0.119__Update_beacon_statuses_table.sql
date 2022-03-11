ALTER TABLE public.beacon_statuses RENAME TO beacon_malfunctions;

ALTER TYPE public.beacon_statuses_vessel_status RENAME TO beacon_malfunctions_vessel_status;
ALTER TYPE public.beacon_statuses_stage RENAME TO beacon_malfunctions_stage;
ALTER TYPE public.beacon_malfunctions_stage RENAME VALUE 'RESUMED_TRANSMISSION' TO 'END_OF_MALFUNCTION';

ALTER INDEX public.beacon_statuses_pkey RENAME TO beacon_malfunctions_pkey;
ALTER SEQUENCE public.beacon_statuses_id_seq RENAME TO beacon_malfunctions_id_seq;

CREATE TYPE public.beacon_malfunctions_end_of_malfunction_reason
AS ENUM (
    'RESUMED_TRANSMISSION',
    'TEMPORARY_INTERRUPTION_OF_SUPERVISION',
    'PERMANENT_INTERRUPTION_OF_SUPERVISION'
);

ALTER TABLE public.beacon_malfunctions
    ADD COLUMN flag_state VARCHAR(100),
    ADD COLUMN end_of_malfunction_reason beacon_malfunctions_end_of_malfunction_reason;

UPDATE public.beacon_malfunctions
SET
    stage = CAST('ARCHIVED' AS beacon_malfunctions_stage),
    vessel_status_last_modification_date_utc = CURRENT_TIMESTAMP
WHERE stage = CAST('END_OF_MALFUNCTION' AS beacon_malfunctions_stage);

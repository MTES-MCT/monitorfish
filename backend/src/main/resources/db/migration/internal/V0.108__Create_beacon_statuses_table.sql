
CREATE TYPE public.beacon_statuses_vessel_status AS ENUM ('AT_SEA', 'AT_PORT', 'NO_NEWS', 'TECHNICAL_STOP', 'ACTIVITY_DETECTED');
CREATE TYPE public.beacon_statuses_stage AS ENUM ('INITIAL_ENCOUNTER', 'FOUR_HOUR_REPORT', 'RELAUNCH_REQUEST', 'TARGETING_VESSEL', 'CROSS_CHECK', 'RESUMED_TRANSMISSION');

CREATE TABLE public.beacon_statuses (
    id serial PRIMARY KEY,
    internal_reference_number VARCHAR(12),
    external_reference_number varchar(50),
    ircs varchar(50),
    vessel_name varchar(100),
    vessel_identifier varchar(30),
    vessel_status beacon_statuses_vessel_status not null,
    stage beacon_statuses_stage not null,
    priority boolean not null,
    malfunction_start_date_utc timestamp not null,
    malfunction_end_date_utc timestamp,
    vessel_status_last_modification_date_utc timestamp not null
);
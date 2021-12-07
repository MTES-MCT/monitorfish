CREATE TYPE public.beacons_status_vessel_status AS ENUM ('AT_SEA', 'AT_PORT', 'NO_NEWS', 'TECHNICAL_STOP', 'ACTIVITY_DETECTED');
CREATE TYPE public.beacons_status_stage AS ENUM ('INITIAL_ENCOUNTER', 'FOUR_HOUR_REPORT', 'RELAUNCH_REQUEST', 'TARGETING_VESSEL', 'CROSS_CHECK', 'RESUMED_TRANSMISSION');

CREATE TABLE public.beacons_status (
    id serial,
    vessel_id INTEGER not null,
    cfr VARCHAR(12),
    vessel_status beacons_status_vessel_status not null,
    stage beacons_status_stage not null,
    priority boolean not null,
    malfunction_start_date_utc timestamp not null,
    malfunction_end_date_utc timestamp,
    vessel_status_last_modification_date_utc timestamp not null
);

CREATE TABLE if not exists public.last_departures (
    cfr VARCHAR(12) PRIMARY KEY,
    trip_number INTEGER,
    departure_datetime_utc TIMESTAMP,
    last_dep_gear_onboard JSONB
);

CREATE INDEX ON public.last_departures (cfr);
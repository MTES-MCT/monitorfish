-- Definition of segments
CREATE TABLE IF NOT EXISTS public.fleet_segments (
    segment VARCHAR(50),
    segment_name VARCHAR(200),
    dirm VARCHAR(10)[],
    gears VARCHAR(3)[],
    fao_areas VARCHAR(15)[],
    target_species VARCHAR(3)[],
    bycatch_species VARCHAR(3)[],
    flag_states VARCHAR(3)[]
);

-- Current segments of each vessel
CREATE TABLE if not exists public.current_segments (
    cfr VARCHAR(12) PRIMARY KEY,
    last_ers_datetime_utc TIMESTAMP,
    departure_datetime_utc TIMESTAMP,
    trip_number DOUBLE PRECISION,
    gear_onboard JSONB,
    species_onboard JSONB,
    segments varchar(50)[],
    total_weight_onboard DOUBLE PRECISION
);


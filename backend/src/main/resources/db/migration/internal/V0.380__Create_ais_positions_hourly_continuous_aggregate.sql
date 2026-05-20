CREATE MATERIALIZED VIEW ais_positions_hourly
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT
    mmsi,
    last(date_time, date_time)                    AS date_time,
    last(latitude, date_time)                     AS latitude,
    last(longitude, date_time)                    AS longitude,
    last(speed, date_time)                        AS speed,
    last(course, date_time)                       AS course,
    last(status, date_time)                       AS status,
    last(imo, date_time)                          AS imo,
    last(ship_type, date_time)                    AS ship_type,
    last(destination, date_time)                  AS destination,
    last(cfr, date_time)                          AS cfr,
    last(external_immatriculation, date_time)     AS external_immatriculation,
    last(vessel_name, date_time)                  AS vessel_name,
    last(ircs, date_time)                         AS ircs,
    last(flag_state, date_time)                   AS flag_state,
    last(length, date_time)                       AS length,
    time_bucket(INTERVAL '1 hour', date_time)     AS bucket
FROM ais_positions
GROUP BY mmsi, bucket;

SELECT add_continuous_aggregate_policy(
    'ais_positions_hourly',
    start_offset      => INTERVAL '6 hours',
    end_offset        => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);

SELECT add_retention_policy('ais_positions_hourly', drop_after => INTERVAL '6 hours');

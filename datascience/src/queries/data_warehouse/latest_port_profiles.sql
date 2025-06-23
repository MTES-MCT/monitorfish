WITH trip_landings AS (
    SELECT DISTINCT cfr, port_locode, landing_datetime_utc
    FROM monitorfish.landings
    WHERE 
        landing_datetime_utc >= {profile_datetime_utc:DateTime} - INTERVAL '1 year'
        AND landing_datetime_utc < {profile_datetime_utc:DateTime}
)

SELECT
    cfr,
    port_locode AS latest_landing_port
FROM trip_landings l
WINDOW vessel_window AS (PARTITION BY cfr ORDER BY landing_datetime_utc DESC)
QUALIFY ROW_NUMBER() OVER vessel_window  = 1
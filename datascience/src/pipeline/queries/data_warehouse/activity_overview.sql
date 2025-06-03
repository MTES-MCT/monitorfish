WITH t AS (
    SELECT 
        toStartOfWeek(far_datetime_utc)::DateTime AS far_week,
        facade,
        landing_facade,
        COALESCE('Dept. ' || landing_region, '-') AS landing_department,
        COALESCE(economic_zone, 'Hors ZEE') AS economic_zone,
        segment_current_year,
        ROUND(longitude, 1) AS longitude_,
        ROUND(latitude, 1) AS latitude_,
        landing_port_longitude,
        landing_port_latitude,
        SUM(weight) AS weight_
    FROM monitorfish.enriched_catches
    WHERE 
        far_datetime_utc >= {from_datetime_utc:DateTime} AND
        far_datetime_utc < {to_datetime_utc:DateTime} AND
        longitude IS NOT NULL AND
        latitude IS NOT NULL AND
        landing_port_longitude IS NOT NULL AND
        landing_port_latitude IS NOT NULL AND
        weight IS NOT NULL
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
)

SELECT
    far_week,
    facade,
    landing_facade,
    landing_department,
    economic_zone,
    segment_current_year AS segment,
    longitude_ AS longitude,
    latitude_ AS latitude,
    landing_port_longitude,
    landing_port_latitude,
    weight_ AS weight
FROM t
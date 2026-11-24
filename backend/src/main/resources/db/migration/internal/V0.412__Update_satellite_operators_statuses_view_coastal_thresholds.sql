-- The status of a satellite operator is now computed separately for coastal beacons
-- (`is_coastal = true`, threshold of 55%) and non-coastal beacons
-- (`is_coastal = false` or unknown, threshold of 70%).
DROP VIEW satellite_operators_statuses;

CREATE VIEW satellite_operators_statuses AS

WITH beacons_with_group AS (
    SELECT
        b.vessel_id,
        b.satellite_operator_id,
        COALESCE(b.is_coastal, false) AS is_coastal
    FROM beacons b
    WHERE b.vessel_id IS NOT NULL
),

recent_positions AS (
    SELECT
        DATE_TRUNC('hour', date_time) AS date_hour,
        b.satellite_operator_id,
        b.is_coastal,
        v.id AS vessel_id
    FROM positions p
    JOIN vessels v
    ON v.cfr = p.internal_reference_number
    JOIN beacons_with_group b
    ON b.vessel_id = v.id
    WHERE
        date_time < DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AND
        date_time >= DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '24 hours'

    UNION ALL

    SELECT
        DATE_TRUNC('hour', date_time) AS date_hour,
        b.satellite_operator_id,
        b.is_coastal,
        v.id AS vessel_id
    FROM positions p
    JOIN vessels v
    ON v.ircs = p.ircs
    JOIN beacons_with_group b
    ON b.vessel_id = v.id
    WHERE
        date_time < DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AND
        date_time >= DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '24 hours'
),

positions_histogram AS (
    SELECT
        date_hour,
        satellite_operator_id,
        is_coastal,
        COUNT(DISTINCT vessel_id) AS nb_vessels_emitting
    FROM recent_positions
    GROUP BY date_hour, satellite_operator_id, is_coastal
),

nb_attributed_beacons_per_operator AS (
    SELECT
        satellite_operator_id,
        is_coastal,
        COUNT(*) AS nb_attributed_beacons
    FROM beacons_with_group
    GROUP BY satellite_operator_id, is_coastal
),

shares_histogram AS (
    SELECT
        h.date_hour,
        h.satellite_operator_id,
        h.is_coastal,
        h.nb_vessels_emitting::DOUBLE PRECISION / n.nb_attributed_beacons::DOUBLE PRECISION AS share_vessels_emitting
    FROM nb_attributed_beacons_per_operator n
    JOIN positions_histogram h
    ON h.satellite_operator_id = n.satellite_operator_id AND h.is_coastal = n.is_coastal
),

operators_and_groups AS (
    SELECT
        s.id AS satellite_operator_id,
        g.is_coastal
    FROM satellite_operators s
    CROSS JOIN (VALUES (true), (false)) AS g(is_coastal)
),

nb_hours_share_ok_per_operator AS (
    SELECT
        og.satellite_operator_id,
        og.is_coastal,
        SUM(
            CASE WHEN sh.share_vessels_emitting > (CASE WHEN og.is_coastal THEN 0.6 ELSE 0.7 END)
            THEN 1 ELSE 0 END
        ) AS nb_hours_with_share_ok
    FROM operators_and_groups og
    LEFT JOIN shares_histogram sh
    ON og.satellite_operator_id = sh.satellite_operator_id AND og.is_coastal = sh.is_coastal
    GROUP BY og.satellite_operator_id, og.is_coastal
)

SELECT
    satellite_operator_id,
    is_coastal,
    CASE WHEN nb_hours_with_share_ok = 24 THEN true ELSE false END AS operator_is_up
FROM nb_hours_share_ok_per_operator
ORDER BY 1, 2 DESC

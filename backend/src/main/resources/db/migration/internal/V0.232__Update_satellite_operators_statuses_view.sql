DROP VIEW satellite_operators_statuses;

CREATE VIEW satellite_operators_statuses AS

WITH activated_beacons_positions_operators AS (
    SELECT
        DATE_TRUNC('hour', date_time) AS date_hour,
        s.id AS satellite_operator_id,
        v.id AS vessel_id
    FROM positions p
    JOIN vessels v
    ON v.cfr = p.internal_reference_number
    JOIN beacons b
    ON b.vessel_id = v.id
    JOIN satellite_operators s
    ON s.id = b.satellite_operator_id
    WHERE
        date_time < DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AND
        date_time >= DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '24 hours' AND
        b.beacon_status = 'ACTIVATED'

    UNION ALL

    SELECT
        DATE_TRUNC('hour', date_time) AS date_hour,
        s.id AS satellite_operator_id,
        v.id AS vessel_id
    FROM positions p
    JOIN vessels v
    ON v.ircs = p.ircs
    JOIN beacons b
    ON b.vessel_id = v.id
    JOIN satellite_operators s
    ON s.id = b.satellite_operator_id
    WHERE
        date_time < DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AND
        date_time >= DATE_TRUNC('hour', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '24 hours' AND
        b.beacon_status = 'ACTIVATED'
),

positions_histogram AS (
    SELECT
        date_hour,
        satellite_operator_id,
        COUNT(DISTINCT vessel_id) AS nb_vessels_emitting
    FROM activated_beacons_positions_operators p
    GROUP BY date_hour, satellite_operator_id
),

nb_activated_beacons_per_operator AS (
    SELECT
        s.id AS satellite_operator_id,
        COUNT(*) AS nb_activated_beacons
    FROM beacons b
    JOIN satellite_operators s
    ON s.id = b.satellite_operator_id
    WHERE beacon_status = 'ACTIVATED'
    GROUP BY s.id
),

shares_histogram AS (
    SELECT
        date_hour,
        s.id AS satellite_operator_id,
        nb_vessels_emitting::DOUBLE PRECISION / nb_activated_beacons::DOUBLE PRECISION AS share_vessels_emitting
    FROM nb_activated_beacons_per_operator n
    JOIN positions_histogram h
    ON h.satellite_operator_id = n.satellite_operator_id
    JOIN satellite_operators s
    ON n.satellite_operator_id = s.id
),

nb_hours_share_ok_per_operator AS (
    SELECT
        s.id AS satellite_operator_id,
        SUM(CASE WHEN share_vessels_emitting > 0.7 THEN 1 ELSE 0 END) AS nb_hours_with_share_ok
    FROM satellite_operators s
    LEFT JOIN shares_histogram sh
    ON s.id = sh.satellite_operator_id
    GROUP BY s.id
)

SELECT
    satellite_operator_id,
    CASE WHEN nb_hours_with_share_ok = 24 THEN true ELSE false END AS operator_is_up
FROM nb_hours_share_ok_per_operator
ORDER BY 1
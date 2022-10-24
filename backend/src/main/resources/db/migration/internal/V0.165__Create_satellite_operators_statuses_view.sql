CREATE VIEW satellite_operators_statuses AS

WITH vessels_last_emissions AS (
    SELECT
        v.id AS vessel_id,
        MAX(last_position_datetime_utc) AS most_recent_emission_datetime_utc
    FROM last_positions l
    JOIN vessels v
    ON v.cfr = l.cfr or v.ircs = l.ircs
    GROUP BY v.id
),

beacons_last_emissions AS (
    SELECT
        s.id AS satellite_operator_id,
        EXTRACT('epoch' FROM CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - e.most_recent_emission_datetime_utc) / 3600 AS hours_since_last_emission
    FROM beacons b
    JOIN satellite_operators s
    ON b.satellite_operator_id = s.id
    JOIN vessels v
    ON v.id = b.vessel_id
    JOIN vessels_last_emissions e
    ON b.vessel_id = e.vessel_id
    WHERE b.beacon_status IN ('ACTIVATED', 'UNSUPERVISED') AND v.flag_state IN ('FR', 'VE')
),

beacons_last_emissions_is_recent AS (
    SELECT
        satellite_operator_id,
        CASE
            WHEN hours_since_last_emission <= 1.0 THEN 1.0
            ELSE 0.0
        END AS is_recent
    FROM beacons_last_emissions
),

operators_recent_data_fraction AS (
    SELECT
        satellite_operator_id,
        (SUM(is_recent)::DOUBLE PRECISION) / (COUNT(*)::DOUBLE PRECISION) AS fraction_of_beacons_with_recent_emissions
    FROM beacons_last_emissions_is_recent
    GROUP BY satellite_operator_id
)

SELECT
    s.id AS satellite_operator_id,
    CASE
        WHEN fraction_of_beacons_with_recent_emissions IS NULL THEN NULL
        WHEN fraction_of_beacons_with_recent_emissions > 0.5 THEN true
        ELSE false
    END AS operator_is_up
FROM satellite_operators s
LEFT JOIN operators_recent_data_fraction df
ON df.satellite_operator_id = s.id
ORDER BY 1
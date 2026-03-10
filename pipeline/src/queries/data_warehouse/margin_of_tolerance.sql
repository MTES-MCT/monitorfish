WITH estimated_live_weights AS (
    SELECT cfr, trip_number, species, SUM(weight) AS elw_weight
    FROM monitorfish.catches
    WHERE far_datetime_utc >= {from_datetime_utc:DateTime}
    GROUP BY cfr, trip_number, species
),

live_weight_equivalents AS (
    SELECT
        cfr,
        trip_number,
        species,
        SUM(weight * COALESCE(conversion_factor, 1)) AS lwe_weight
    FROM monitorfish.landings
    WHERE landing_datetime_utc >= {from_datetime_utc:DateTime}
    GROUP BY cfr, trip_number, species
),

live_weight_equivalents_top_5 AS (
    SELECT
        *,
        CASE
            WHEN lwe_weight <= 100 THEN 0.8 * lwe_weight
            ELSE 0.9 * lwe_weight
        END AS min_allowed_elw,
        CASE
            WHEN lwe_weight <= 100 THEN 1.2 * lwe_weight
            ELSE 1.1 * lwe_weight
        END AS max_allowed_elw
    FROM live_weight_equivalents
    WINDOW win AS (PARTITION BY cfr, trip_number ORDER BY lwe_weight DESC)
    QUALIFY
        ROW_NUMBER() OVER win <= 5
        AND lwe_weight / (SUM(lwe_weight) OVER (PARTITION BY cfr, trip_number)) >= 0.1
),

compliant_trips AS (
    SELECT
        lwe.cfr AS cfr,
        lwe.trip_number AS trip_number
    FROM live_weight_equivalents_top_5 lwe
    LEFT JOIN estimated_live_weights elw
    ON 
        elw.cfr = lwe.cfr AND
        elw.trip_number = lwe.trip_number AND
        elw.species = lwe.species
    GROUP BY lwe.cfr, lwe.trip_number
    HAVING Min(elw_weight BETWEEN min_allowed_elw AND max_allowed_elw) = 1
)

SELECT
    cfr,
    COUNT(*) AS compliant_trips
FROM compliant_trips
GROUP BY cfr
WITH weight_per_species AS (
    SELECT
        cfr,
        species,
        SUM(weight) AS weight
    FROM monitorfish.enriched_catches
    WHERE
        far_datetime_utc >= {start_datetime_utc:DateTime} - INTERVAL '1 year'
        AND far_datetime_utc < {start_datetime_utc:DateTime}
    GROUP BY 1, 2
)

SELECT
    cfr,
    species,
    weight / SUM(weight) OVER (PARTITION BY cfr) AS share
FROM weight_per_species
ORDER BY 1, 3 DESC

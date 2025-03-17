WITH weight_per_gear AS (
    SELECT
        cfr,
        gear,
        SUM(weight) AS weight
    FROM monitorfish.enriched_catches
    WHERE
        far_datetime_utc >= {start_datetime_utc:DateTime} - INTERVAL '1 year'
        AND far_datetime_utc < {start_datetime_utc:DateTime}
    GROUP BY 1, 2
)

SELECT
    cfr,
    gear,
    weight / SUM(weight) OVER (PARTITION BY cfr) AS share
FROM weight_per_gear
ORDER BY 1, 3 DESC

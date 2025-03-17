WITH weight_per_segment AS (
    SELECT
        cfr,
        segment_current_year,
        SUM(weight) AS weight
    FROM monitorfish.enriched_catches
    WHERE
        far_datetime_utc >= {start_datetime_utc:DateTime} - INTERVAL '1 year'
        AND far_datetime_utc < {start_datetime_utc:DateTime}
    GROUP BY 1, 2
)

SELECT
    cfr,
    segment_current_year AS segment,
    weight / SUM(weight) OVER (PARTITION BY cfr) AS share
FROM weight_per_segment
ORDER BY 1, 3 DESC

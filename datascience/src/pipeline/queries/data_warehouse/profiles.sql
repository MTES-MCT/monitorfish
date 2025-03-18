WITH weights AS (
    SELECT
        cfr,
        {profile_dimension:Identifier},
        SUM(weight) AS weight
    FROM monitorfish.enriched_catches
    WHERE
        far_datetime_utc >= {profile_datetime_utc:DateTime} - toIntervalDay({duration_in_days:Integer})
        AND far_datetime_utc < {profile_datetime_utc:DateTime}
    GROUP BY 1, 2
)

SELECT
    cfr,
    {profile_dimension:Identifier},
    weight / SUM(weight) OVER (PARTITION BY cfr) AS share
FROM weights
ORDER BY 1, 3 DESC
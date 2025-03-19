WITH weights AS (
    SELECT
        cfr,
        port_locode,
        SUM(weight) AS weight
    FROM monitorfish.landings
    WHERE
        landing_datetime_utc >= {profile_datetime_utc:DateTime} - toIntervalDay({duration_in_days:Integer})
        AND landing_datetime_utc < {profile_datetime_utc:DateTime}
    GROUP BY 1, 2
)

SELECT
    cfr,
    port_locode,
    weight / SUM(weight) OVER (PARTITION BY cfr) AS share
FROM weights
ORDER BY 1, 3 DESC
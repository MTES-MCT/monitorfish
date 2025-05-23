WITH weights AS (
    SELECT
        cfr,
        port_locode,
        SUM(weight) AS weight_
    FROM monitorfish.landings
    WHERE
        landing_datetime_utc >= {profile_datetime_utc:DateTime} - toIntervalDay({duration_in_days:Integer})
        AND landing_datetime_utc < {profile_datetime_utc:DateTime}
        AND weight > 0
    GROUP BY 1, 2
)

SELECT
    cfr,
    port_locode,
    weight_ / SUM(weight_) OVER (PARTITION BY cfr) AS share
FROM weights
ORDER BY 1, 3 DESC
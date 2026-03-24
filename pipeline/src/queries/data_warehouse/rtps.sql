WITH t AS (
    SELECT
        cfr,
        trip_number,
        MAX(return_datetime_utc)::DateTime64 AS return_datetime_
    FROM monitorfish.rtps
    WHERE
        return_datetime_utc >= {from_datetime_utc:DateTime}
        AND flag_state = 'FRA'
        AND trip_number IS NOT NULL
    GROUP BY 1, 2
)

SELECT
    cfr,
    trip_number,
    return_datetime_ AS return_datetime
FROM t

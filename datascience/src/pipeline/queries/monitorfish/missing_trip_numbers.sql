
WITH vessels_with_missing_trip_numbers AS (
    SELECT DISTINCT cfr
    FROM logbook_reports
    WHERE
        operation_datetime_utc < current_timestamp AND
        operation_type IN ('DAT', 'COR')
    AND trip_number IS NULL
),

t1 AS (
    SELECT 
        id,
        cfr,
        operation_type,
        log_type,
        CASE 
            WHEN log_type = 'PNO' THEN LEAST(
                operation_datetime_utc, 
                (value->>'predictedArrivalDatetimeUtc')::timestamptz
            )
            ELSE COALESCE(
                (CASE
                    WHEN log_type = 'DEP' THEN value->>'departureDatetimeUtc'
                    WHEN log_type = 'FAR' THEN value->>'farDatetimeUtc'
                    WHEN log_type = 'DIS' THEN value->>'discardDatetimeUtc'
                    WHEN log_type = 'COE' THEN value->>'effortZoneEntryDatetimeUtc'
                    WHEN log_type = 'COX' THEN value->>'effortZoneExitDatetimeUtc'
                    WHEN log_type = 'LAN' THEN value->>'landingDatetimeUtc'
                    WHEN log_type = 'EOF' THEN value->>'endOfFishingDatetimeUtc'
                    WHEN log_type = 'RTP' THEN value->>'returnDatetimeUtc'
                END)::timestamptz,
                report_datetime_utc
            )
        END AS order_datetime_utc,
        operation_datetime_utc
    FROM logbook_reports
    WHERE operation_datetime_utc < CURRENT_TIMESTAMP
    AND operation_type IN ('DAT', 'COR')
    AND cfr IN (SELECT cfr FROM vessels_with_missing_trip_numbers)
),


t2 AS (
    SELECT 
        *,
        EXTRACT(YEAR FROM order_datetime_utc)::INTEGER AS year,
        COALESCE((LAG(log_type, 1) OVER cfr_window) = 'LAN', FALSE) AS follows_lan,
        RANK() OVER cfr_window AS rk
    FROM t1
    WHERE operation_type = 'DAT'
    WINDOW cfr_window AS (PARTITION BY cfr ORDER BY order_datetime_utc)
),

trip_starts AS (
    SELECT 
        id,
        year * 10000 + SUM(1) OVER (PARTITION BY cfr, year ORDER BY order_datetime_utc) AS trip_number
    FROM t2
    WHERE rk = 1 OR follows_lan OR (log_type = 'DEP')
)

SELECT
    t1.id,
    MAX(trip_starts.trip_number) OVER (PARTITION BY cfr ORDER BY order_datetime_utc) AS trip_number
FROM t1
LEFT JOIN trip_starts
ON t1.id = trip_starts.id
-- For each vessel and for each year, messages are sorted according to the time and 
-- date of the activity recorded, and not to the time and date of sending the message,
-- because they can be sent in advance or a posteriori - except for PNOs, for which we
-- use the time and date at which the message is sent.

-- After sorting the messages in this way, we consider that a new trip number starts 
-- at each DEP or just after each LAN message.

WITH t1 AS (
    SELECT 
        id,
        cfr,
        log_type,
        CASE 
            WHEN log_type = 'PNO' THEN LEAST(
                operation_datetime_utc, 
                (value->>'predictedArrivalDatetimeUtc')::timestamptz
            )
            ELSE (CASE
                WHEN log_type = 'DEP' THEN value->>'departureDatetimeUtc'
                WHEN log_type = 'FAR' THEN value->>'farDatetimeUtc'
                WHEN log_type = 'DIS' THEN value->>'discardDatetimeUtc'
                WHEN log_type = 'COE' THEN value->>'effortZoneEntryDatetimeUtc'
                WHEN log_type = 'COX' THEN value->>'effortZoneExitDatetimeUtc'
                WHEN log_type = 'LAN' THEN value->>'landingDatetimeUtc'
                WHEN log_type = 'EOF' THEN value->>'endOfFishingDatetimeUtc'
                WHEN log_type = 'RTP' THEN value->>'returnDatetimeUtc'
            END)::timestamptz
        END AS order_datetime_utc
    FROM ers 
    WHERE operation_datetime_utc < CURRENT_TIMESTAMP
    AND operation_type IN ('DAT', 'COR')
    AND trip_number IS NULL
),


t2 AS (
    SELECT 
        *,
        EXTRACT(YEAR FROM order_datetime_utc)::INTEGER AS year,
        COALESCE((LAG(log_type, 1) OVER cfr_window) = 'LAN', FALSE) AS follows_lan,
        RANK() OVER cfr_window AS rk
    FROM t1
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
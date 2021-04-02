WITH ordered_ers AS (
    SELECT 
        cfr,
        trip_number,
        value->'gearOnboard' AS gear_onboard,
        (value->>'departureDatetimeUtc')::timestamptz AS departure_datetime_utc,
        ROW_NUMBER() OVER(PARTITION BY cfr ORDER BY operation_datetime_utc DESC) as rk
    FROM public.ers
    WHERE log_type = 'DEP'
    AND operation_type IN ('DAT', 'COR')
    AND operation_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '6 months'
)

SELECT 
    cfr,
    trip_number,
    departure_datetime_utc,
    gear_onboard AS last_dep_gear_onboard
FROM ordered_ers
WHERE rk=1
WITH deleted_messages AS (
    SELECT referenced_ers_id
    FROM public.ers
    WHERE operation_type = 'DEL'
    AND operation_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '6 months'
),

ordered_deps AS (
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
    AND ers_id NOT IN (SELECT referenced_ers_id FROM deleted_messages)
),

last_deps AS (
    SELECT 
        cfr,
        departure_datetime_utc,
        trip_number,
        gear_onboard
    FROM ordered_deps
    WHERE rk=1
),

ordered_ers AS (
    SELECT
        cfr,
        operation_datetime_utc,
        ROW_NUMBER() OVER(PARTITION BY cfr ORDER BY operation_datetime_utc DESC) as rk
    FROM public.ers
    WHERE operation_type IN ('DAT', 'COR')
    AND operation_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '6 months'
),

last_ers AS (
    SELECT 
        cfr,
        operation_datetime_utc
    FROM ordered_ers
    WHERE rk=1
),


catches AS (
    SELECT
        ers.cfr,
        ers.ers_id,
        ers.referenced_ers_id,
        ers.operation_type,
        (ers.value)->>'gear' as gear,
        jsonb_array_elements((ers.value)->'catches')->>'species' as species,
        (jsonb_array_elements((ers.value)->'catches')->>'weight')::DOUBLE PRECISION as weight,
        jsonb_array_elements((ers.value)->'catches')->>'faoZone' as fao_area
    FROM public.ers
    JOIN last_deps
    ON ers.cfr = last_deps.cfr
    AND ers.operation_datetime_utc > last_deps.departure_datetime_utc
    WHERE log_type = 'FAR'
    AND operation_type IN ('DAT', 'COR')
    AND operation_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '6 months'
    AND operation_number NOT IN (SELECT referenced_ers_id FROM deleted_messages)
),

corrected_catches AS (
    SELECT 
        cfr,
        ers_id,
        species,
        weight,
        gear,
        fao_area
    FROM catches
    WHERE ers_id NOT IN (SELECT referenced_ers_id FROM catches WHERE operation_type = 'COR')
),


summed_catches AS (
    SELECT
        cfr,
        species,
        gear,
        fao_area,
        SUM(weight) as weight
    FROM corrected_catches
    GROUP BY cfr, species, gear, fao_area
)


SELECT
    COALESCE(last_ers.cfr, last_deps.cfr) AS cfr,
    last_ers.operation_datetime_utc AS last_ers_datetime_utc,
    departure_datetime_utc,
    trip_number,
    gear_onboard,
    species,
    gear,
    fao_area,
    weight
FROM last_ers
FULL OUTER JOIN last_deps
ON last_ers.cfr = last_deps.cfr
LEFT JOIN summed_catches
ON last_ers.cfr = summed_catches.cfr

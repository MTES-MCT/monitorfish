WITH deleted_or_corrected_messages AS (
    SELECT referenced_report_id
    FROM public.logbook_reports
    WHERE operation_type IN ('DEL', 'COR')
    AND operation_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '6 months'
    -- exclude VisioCapture (which is not real time but has several months of delay) from current_catches
    AND (software IS NULL OR software NOT LIKE '%VISIOCaptures%')
),

ordered_deps AS (
    SELECT
        cfr,
        ircs,
        external_identification,
        trip_number,
        (value->>'departureDatetimeUtc')::timestamptz AS departure_datetime_utc,
        ROW_NUMBER() OVER(PARTITION BY cfr ORDER BY (value->>'departureDatetimeUtc')::timestamptz DESC) as rk
    FROM public.logbook_reports
    WHERE log_type = 'DEP'
    AND operation_datetime_utc > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '6 months'
    AND (value->>'departureDatetimeUtc')::timestamptz < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '24 hours'
    AND report_id NOT IN (SELECT referenced_report_id FROM deleted_or_corrected_messages)
    AND (software IS NULL OR software NOT LIKE '%VISIOCaptures%')
),

last_deps AS (
    SELECT 
        cfr,
        ircs,
        external_identification,
        departure_datetime_utc,
        trip_number
    FROM ordered_deps
    WHERE rk=1
),

last_logbook_reports AS (
    SELECT
        cfr,
        MAX(report_datetime_utc) AS last_logbook_message_datetime_utc
    FROM public.logbook_reports
    WHERE operation_type IN ('DAT', 'COR')
    AND operation_datetime_utc > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '6 months'
    AND report_datetime_utc < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '24 hours'
    AND (software IS NULL OR software NOT LIKE '%VISIOCaptures%')
    GROUP BY cfr
),

catches AS (
    SELECT
        r.cfr,
        r.report_id,
        (jsonb_array_elements(r.value -> 'hauls'))->>'gear' as gear,
        ((jsonb_array_elements(r.value -> 'hauls'))->>'mesh')::DOUBLE PRECISION as mesh,
        (jsonb_array_elements(r.value -> 'hauls'))->>'dimensions' as dimensions,
        jsonb_array_elements((jsonb_array_elements(r.value -> 'hauls'))->'catches')->>'species' as species,
        (jsonb_array_elements((jsonb_array_elements(r.value -> 'hauls'))->'catches')->>'weight')::DOUBLE PRECISION as weight,
        jsonb_array_elements((jsonb_array_elements(r.value -> 'hauls'))->'catches')->>'faoZone' as fao_area
    FROM public.logbook_reports r
    JOIN last_deps d
    ON r.cfr = d.cfr
    AND r.trip_number = d.trip_number
    WHERE log_type = 'FAR'
    AND operation_type IN ('DAT', 'COR')
    AND operation_datetime_utc > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '6 months'
    AND operation_number NOT IN (SELECT referenced_report_id FROM deleted_or_corrected_messages)
    AND (software IS NULL OR software NOT LIKE '%VISIOCaptures%')
),

summed_catches AS (
    SELECT
        cfr,
        species,
        gear,
        fao_area,
        SUM(weight) as weight
    FROM catches
    GROUP BY cfr, species, gear, fao_area
),

gear_onboard AS (
    SELECT
        cfr,
        jsonb_agg(DISTINCT 
            jsonb_build_object(
                'gear', gear,
                'mesh', mesh,
                'dimensions', dimensions
            )
        ) AS gear_onboard
    FROM catches
    GROUP BY cfr
)

SELECT
    COALESCE(last_logbook_reports.cfr, last_deps.cfr) AS cfr,
    last_deps.ircs,
    last_deps.external_identification AS external_immatriculation,
    last_logbook_reports.last_logbook_message_datetime_utc,
    departure_datetime_utc,
    trip_number,
    go.gear_onboard,
    species,
    gear,
    fao_area,
    weight
FROM last_logbook_reports
FULL OUTER JOIN last_deps
ON last_logbook_reports.cfr = last_deps.cfr
LEFT JOIN summed_catches
ON last_logbook_reports.cfr = summed_catches.cfr
LEFT JOIN gear_onboard go
ON last_logbook_reports.cfr = go.cfr

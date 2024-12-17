WITH acknowledged_messages AS (
    SELECT referenced_report_id
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= CURRENT_TIMESTAMP - INTERVAL ':number_of_days days'
        AND operation_datetime_utc < CURRENT_TIMESTAMP + INTERVAL '6 hours'
        AND operation_type ='RET'
        AND value->>'returnStatus' = '000'
),

deleted_messages AS (
    SELECT
        operation_number,
        referenced_report_id
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= CURRENT_TIMESTAMP - INTERVAL ':number_of_days days'
        AND operation_datetime_utc < CURRENT_TIMESTAMP + INTERVAL '6 hours'
        AND operation_type ='DEL'
),

acknowledged_deleted_messages AS (
    SELECT referenced_report_id
    FROM deleted_messages
    WHERE
        operation_number IN (SELECT referenced_report_id FROM acknowledged_messages)
),

corrected_messages AS (
    SELECT
        referenced_report_id
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= CURRENT_TIMESTAMP - INTERVAL ':number_of_days days'
        AND operation_datetime_utc < CURRENT_TIMESTAMP + INTERVAL '6 hours'
        AND operation_type ='COR'
        AND (
            flag_state NOT IN ('FRA', 'GUF', 'VEN') -- Flag states for which we receive RET
            OR report_id IN (SELECT referenced_report_id FROM acknowledged_messages)
        )   
),

ordered_deps AS (
    SELECT
        cfr,
        ircs,
        external_identification AS external_immatriculation,
        trip_number,
        activity_datetime_utc AS departure_datetime_utc,
        ROW_NUMBER() OVER (PARTITION BY cfr ORDER BY activity_datetime_utc DESC) as rk
    FROM public.logbook_reports
    WHERE
        log_type = 'DEP'
        AND operation_datetime_utc > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL ':number_of_days days'
        AND activity_datetime_utc < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '24 hours'
        AND report_id NOT IN (SELECT referenced_report_id FROM corrected_messages)
        AND NOT (
            report_id IN (SELECT referenced_report_id FROM acknowledged_deleted_messages)
            OR (
                report_id IN (SELECT referenced_report_id FROM deleted_messages)
                AND flag_state NOT IN ('FRA', 'GUF', 'VEN')
            )
        )
        AND (
            flag_state NOT IN ('FRA', 'GUF', 'VEN') -- Flag states for which we receive RET
            OR report_id IN (SELECT referenced_report_id FROM acknowledged_messages)
        )
        -- Exclude data that is not real-time electronic logbook data
        AND (
            software IS NULL -- Non french vessels
            OR software NOT LIKE '%VISIOCaptures%'
        )
),

last_deps AS (
    SELECT 
        cfr,
        ircs,
        external_immatriculation,
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
    AND operation_datetime_utc > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL ':number_of_days days'
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
    WHERE
        log_type = 'FAR'
        AND operation_datetime_utc > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL ':number_of_days days'
        AND report_id NOT IN (SELECT referenced_report_id FROM corrected_messages)
        AND NOT (
            report_id IN (SELECT referenced_report_id FROM acknowledged_deleted_messages)
            OR (
                report_id IN (SELECT referenced_report_id FROM deleted_messages)
                AND r.flag_state NOT IN ('FRA', 'GUF', 'VEN')
            )
        )
        AND (
            flag_state NOT IN ('FRA', 'GUF', 'VEN') -- Flag states for which we receive RET
            OR report_id IN (SELECT referenced_report_id FROM acknowledged_messages)
        )
        AND (software IS NULL OR software NOT LIKE '%VISIOCaptures%')
),

summed_catches AS (
    SELECT
        cfr,
        species,
        gear,
        fao_area,
        mesh,
        SUM(weight) as weight
    FROM catches
    GROUP BY cfr, species, gear, fao_area, mesh
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
    ROW_NUMBER() OVER (ORDER BY COALESCE(l.cfr, last_deps.cfr), species) AS catch_id,
    COALESCE(l.cfr, last_deps.cfr) AS cfr,
    COALESCE(
        v_cfr.id,
        v_ircs.id,
        v_ext.id
    ) AS vessel_id,
    EXTRACT(YEAR from CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AS year,
    fao_area,
    gear,
    mesh,
    species,
    s.scip_species_type,
    weight,
    COALESCE(
        v_cfr.vessel_type,
        v_ircs.vessel_type,
        v_ext.vessel_type
    ) AS vessel_type,
    last_deps.ircs,
    last_deps.external_immatriculation,
    l.last_logbook_message_datetime_utc,
    departure_datetime_utc,
    trip_number,
    go.gear_onboard
FROM last_logbook_reports l
FULL OUTER JOIN last_deps
ON l.cfr = last_deps.cfr
LEFT JOIN summed_catches
ON l.cfr = summed_catches.cfr
LEFT JOIN gear_onboard go
ON l.cfr = go.cfr
LEFT JOIN species s
ON s.species_code = summed_catches.species
LEFT JOIN vessels v_cfr ON v_cfr.cfr = COALESCE(l.cfr, last_deps.cfr)
LEFT JOIN vessels v_ircs ON v_ircs.ircs = last_deps.ircs AND v_ircs.cfr IS NULL
LEFT JOIN vessels v_ext ON v_ext.external_immatriculation = last_deps.external_immatriculation AND v_ext.cfr IS NULL
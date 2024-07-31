WITH deleted_corrected_or_rejected_messages AS (
    SELECT referenced_report_id
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= :min_pno_date - INTERVAL '1 day'
        AND operation_datetime_utc <= :max_pno_date + INTERVAL '1 week'
        AND 
            (
            operation_type IN ('COR', 'DEL')
            OR (
                operation_type = 'RET'
                AND value->>'returnStatus' = '002'
            )
        )
),

pno_species AS (
    SELECT
        id,
        cfr,
        flag_state,
        trip_number,
        report_datetime_utc,
        p.locode,
        p.facade,
        (r.value->>'tripStartDate')::TIMESTAMPTZ AS trip_start_date,
        (r.value->>'predictedArrivalDatetimeUtc')::TIMESTAMPTZ AS predicted_arrival_datetime_utc,
        catch->>'species' AS species,
        catch->>'faoZone' AS fao_area,
        (catch->>'weight')::DOUBLE PRECISION AS weight
    FROM logbook_reports r
    LEFT JOIN ports p
    ON p.locode = r.value->>'port'
    LEFT JOIN jsonb_array_elements(value->'catchOnboard') catch ON true
    WHERE
        operation_datetime_utc >= :min_pno_date
        AND operation_datetime_utc < :max_pno_date
        AND log_type = 'PNO'
        AND NOT enriched
),

pno_trips AS (
    SELECT DISTINCT
        id,
        cfr,
        report_datetime_utc,
        trip_start_date,
        predicted_arrival_datetime_utc
    FROM pno_species
),

far_gears AS (
    SELECT
        t.id,
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'gear', haul->>'gear', 
                'mesh', (haul->>'mesh')::DOUBLE PRECISION,
                'dimensions', haul->>'dimensions'
                )
            ) AS far_gears
    FROM pno_trips t
    LEFT JOIN logbook_reports far
    ON
        far.operation_datetime_utc >= :min_trip_date
        AND far.operation_datetime_utc < :max_trip_date
        AND far.log_type = 'FAR'
        AND far.cfr = t.cfr
        AND far.report_id NOT IN (SELECT referenced_report_id FROM deleted_corrected_or_rejected_messages)
    JOIN jsonb_array_elements(far.value->'hauls') haul
    ON
        (haul->>'farDatetimeUtc')::TIMESTAMPTZ >= t.trip_start_date
        AND (haul->>'farDatetimeUtc')::TIMESTAMPTZ <= GREATEST(t.predicted_arrival_datetime_utc, t.report_datetime_utc AT TIME ZONE 'UTC')
        AND haul->>'gear' IS NOT NULL
    GROUP BY t.id
),

dep_gears AS (
    SELECT DISTINCT ON (t.id)
        t.id,
        dep.value->'gearOnboard' AS dep_gears
    FROM pno_trips t
    JOIN logbook_reports dep
    ON
        dep.operation_datetime_utc >= :min_trip_date - INTERVAL '1 day'
        AND dep.operation_datetime_utc < :max_trip_date
        AND dep.log_type = 'DEP'
        AND dep.cfr = t.cfr
        AND dep.report_id NOT IN (SELECT referenced_report_id FROM deleted_corrected_or_rejected_messages)
        -- sometimes the tripStartDate of PNO messages is rounded a few hours after the actual departure. Adding a 24h buffer is a safety measure to find the DEP in these cases.
        -- Taking the most recent one (with DISTINCT ON / ORDER BY) avoids taking a dep from the previous trip.
        AND (value->>'departureDatetimeUtc')::TIMESTAMPTZ >= t.trip_start_date - INTERVAL '24 hours' 
        AND (value->>'departureDatetimeUtc')::TIMESTAMPTZ <= GREATEST(t.predicted_arrival_datetime_utc, t.report_datetime_utc AT TIME ZONE 'UTC')
    ORDER BY id, (value->>'departureDatetimeUtc')::TIMESTAMPTZ DESC 
)

SELECT
    s.id AS logbook_reports_pno_id,
    s.cfr,
    predicted_arrival_datetime_utc AT TIME ZONE 'UTC' AS predicted_arrival_datetime_utc,
    EXTRACT('YEAR' FROM predicted_arrival_datetime_utc)::INTEGER AS year,
    s.species,
    COALESCE(fg.far_gears, dg.dep_gears, '[]'::jsonb) AS trip_gears,
    s.fao_area,
    s.weight,
    s.flag_state,
    s.locode,
    s.facade
FROM pno_species s
LEFT JOIN far_gears fg
ON s.id = fg.id
LEFT JOIN dep_gears dg
ON s.id = dg.id
WITH deleted_messages AS (
    SELECT
        operation_number,
        referenced_report_id
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= :start_datetime_utc - INTERVAL '4 hours'
        AND operation_datetime_utc < :end_datetime_utc + INTERVAL '8 hours'
        AND operation_type ='DEL'
),

acknowledged_messages AS (
    SELECT referenced_report_id
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= :start_datetime_utc - INTERVAL '4 hours'
        AND operation_datetime_utc < :end_datetime_utc + INTERVAL '8 hours'
        AND operation_type ='RET'
        AND value->>'returnStatus' = '000'
),

acknowledged_deleted_messages AS (
    SELECT referenced_report_id
    FROM deleted_messages
    WHERE
        operation_number IN (SELECT referenced_report_id FROM acknowledged_messages)
)

(SELECT DISTINCT ON (r.report_id) -- In rare cases the same PNO with the same data and the same report_id is sent multiple times in messages with different operation numbers
    r.id,
    r.operation_datetime_utc,
    r.report_id,
    r.report_datetime_utc,
    v.id as vessel_id,
    r.cfr,
    COALESCE(r.ircs, v.ircs) AS ircs,
    COALESCE(r.external_identification, v.external_immatriculation) AS external_identification,
    COALESCE(r.vessel_name, v.vessel_name) AS vessel_name,
    COALESCE(r.flag_state, v.flag_state) AS flag_state,
    r.value->>'purpose' AS purpose,
    r.value->'catchOnboard' AS catch_onboard,
    r.value->>'port' AS port_locode,
    p.port_name,
    p.facade,
    (r.value->>'predictedArrivalDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC' AS predicted_arrival_datetime_utc,
    (r.value->>'predictedLandingDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC' AS predicted_landing_datetime_utc,
    r.trip_gears,
    r.trip_segments,
    r.value->'pnoTypes' AS pno_types,
    r.value->>'note' AS note,
    v.length AS vessel_length,
    v.mmsi,
    (r.value->>'riskFactor')::DOUBLE PRECISION AS risk_factor,
    rf.last_control_datetime_utc,
    COALESCE(rf.last_control_logbook_infractions, '[]') AS last_control_logbook_infractions,
    COALESCE(rf.last_control_gear_infractions, '[]') AS last_control_gear_infractions,
    COALESCE(rf.last_control_species_infractions, '[]') AS last_control_species_infractions,
    COALESCE(rf.last_control_other_infractions, '[]') AS last_control_other_infractions,
    (value->>'isVerified')::BOOLEAN AS is_verified,
    (value->>'isBeingSent')::BOOLEAN AS is_being_sent,
    'LOGBOOK' AS source
FROM logbook_reports r
LEFT JOIN vessels v
ON v.cfr = r.cfr
LEFT JOIN risk_factors rf
ON rf.cfr = r.cfr
LEFT JOIN ports p
ON p.locode = r.value->>'port'
WHERE
    operation_datetime_utc >= :start_datetime_utc
    AND operation_datetime_utc < :end_datetime_utc
    AND log_type='PNO'
    AND enriched
    AND (
        (value->>'isBeingSent')::BOOLEAN IS true
        OR report_id NOT IN (SELECT report_id FROM prior_notification_pdf_documents)
    )
    AND NOT (
            report_id IN (SELECT referenced_report_id FROM acknowledged_deleted_messages)
            OR (
                report_id IN (SELECT referenced_report_id FROM deleted_messages)
                AND r.flag_state NOT IN ('FRA', 'GUF', 'VEN')
            )
        )
    AND (
        r.flag_state NOT IN ('FRA', 'GUF', 'VEN') -- Flag states for which we receive RET
        OR report_id IN (SELECT referenced_report_id FROM acknowledged_messages)
        OR (value->>'isVerified')::BOOLEAN IS true
    )
    AND (
        (value->>'isInvalidated') IS NULL
        OR (value->>'isInvalidated')::BOOLEAN IS false
    )
ORDER BY report_id)

UNION ALL

(SELECT
    NULL AS id,
    NULL AS operation_datetime_utc,
    r.report_id,
    r.sent_at AT TIME ZONE 'UTC' AS report_datetime_utc,
    v.id as vessel_id,
    r.cfr,
    v.ircs,
    v.external_immatriculation AS external_identification,
    r.vessel_name,
    r.flag_state,
    r.value->>'purpose' AS purpose,
    r.value->'catchOnboard' AS catch_onboard,
    r.value->>'port' AS port_locode,
    p.port_name,
    p.facade,
    (r.value->>'predictedArrivalDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC' AS predicted_arrival_datetime_utc,
    (r.value->>'predictedLandingDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC' AS predicted_landing_datetime_utc,
    (CASE WHEN jsonb_typeof(r.trip_gears) = 'array' THEN r.trip_gears ELSE '[]'::jsonb END) AS trip_gears,
    (CASE WHEN jsonb_typeof(r.trip_segments) = 'array' THEN r.trip_segments ELSE '[]'::jsonb END) AS trip_segments,
    (CASE WHEN jsonb_typeof(r.value->'pnoTypes') = 'array' THEN r.value->'pnoTypes' ELSE '[]'::jsonb END) AS pno_types,
    r.value->>'note' AS note,
    v.length AS vessel_length,
    v.mmsi,
    (r.value->>'riskFactor')::DOUBLE PRECISION AS risk_factor,
    rf.last_control_datetime_utc,
    COALESCE(rf.last_control_logbook_infractions, '[]') AS last_control_logbook_infractions,
    COALESCE(rf.last_control_gear_infractions, '[]') AS last_control_gear_infractions,
    COALESCE(rf.last_control_species_infractions, '[]') AS last_control_species_infractions,
    COALESCE(rf.last_control_other_infractions, '[]') AS last_control_other_infractions,
    (value->>'isVerified')::BOOLEAN AS is_verified,
    (value->>'isBeingSent')::BOOLEAN AS is_being_sent,
    'MANUAL' AS source
FROM manual_prior_notifications r
LEFT JOIN vessels v
ON v.id = r.vessel_id
LEFT JOIN risk_factors rf
ON rf.vessel_id = r.vessel_id
LEFT JOIN ports p
ON p.locode = r.value->>'port'
WHERE
    (
        (value->>'isInvalidated') IS NULL
        OR (value->>'isInvalidated')::BOOLEAN IS false
    )
    AND (
        (value->>'isBeingSent')::BOOLEAN IS true
        OR report_id NOT IN (SELECT report_id FROM prior_notification_pdf_documents)
    )
ORDER BY report_id)
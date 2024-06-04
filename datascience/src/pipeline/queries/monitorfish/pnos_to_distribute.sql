WITH deleted_messages AS (
    SELECT referenced_report_id
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
)

SELECT
    r.id,
    r.operation_number,
    r.operation_datetime_utc,
    r.operation_type,
    r.report_id,
    r.report_datetime_utc,
    r.cfr,
    r.ircs,
    r.external_identification,
    r.vessel_name,
    r.flag_state,
    r.value->>'purpose' AS purpose,
    r.value->'catchOnboard' AS catch_onboard,
    r.value->>'port' AS port_locode,
    p.port_name,
    (r.value->>'predictedArrivalDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC' AS predicted_arrival_datetime_utc,
    (r.value->>'predictedLandingDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC' AS predicted_landing_datetime_utc,
    r.trip_gears,
    r.trip_segments,
    r.value->'pnoTypes' AS pno_types,
    v.length AS vessel_length,
    v.mmsi,
    rf.risk_factor,
    rf.last_control_datetime_utc
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
    AND (value->>'isBeingSent')::BOOLEAN IS true
    AND report_id NOT IN (SELECT referenced_report_id FROM deleted_messages)
    AND (
        transmission_format = 'FLUX'
        OR (value->>'isVerified')::BOOLEAN IS true
        OR (
            transmission_format = 'ERS'
            AND report_id IN (SELECT referenced_report_id FROM acknowledged_messages)
        )
    )
ORDER BY id
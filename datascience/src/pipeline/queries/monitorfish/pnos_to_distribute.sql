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
    id,
    operation_number,
    operation_datetime_utc,
    operation_type,
    report_id,
    report_datetime_utc,
    cfr,
    ircs,
    external_identification,
    vessel_name,
    flag_state,
    value,
    trip_gears,
    trip_segments
FROM logbook_reports
WHERE
    operation_datetime_utc >= :start_datetime_utc
    AND operation_datetime_utc < :end_datetime_utc
    AND log_type='PNO'
    AND (value->>'isPnoToDistribute')::BOOLEAN IS true
    AND report_id NOT IN (SELECT referenced_report_id FROM deleted_messages)
    AND (
        transmission_format = 'FLUX'
        OR (
            transmission_format = 'ERS'
            AND report_id IN (SELECT referenced_report_id FROM acknowledged_messages)
        )
    )
ORDER BY id
WITH deleted_corrected_or_rejected_messages AS (
    SELECT referenced_report_id
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= :pno_emission_start_datetime_utc - INTERVAL '1 day'
        AND operation_datetime_utc <= :pno_emission_end_datetime_utc + INTERVAL '1 week'
        AND 
            (
            operation_type IN ('COR', 'DEL')
            OR (
                operation_type = 'RET'
                AND value->>'returnStatus' = '002'
            )
        )
)

SELECT
    MIN((r.value->>'tripStartDate')::TIMESTAMPTZ) AS min_trip_start_date,
    MAX((r.value->>'predictedArrivalDatetimeUtc')::TIMESTAMPTZ) AS max_predicted_arrival_datetime_utc
FROM logbook_reports r
WHERE
    --operation_datetime_utc AT TIME ZONE 'UTC' >= :pno_emission_start_datetime_utc
    operation_datetime_utc  <= :pno_emission_end_datetime_utc + INTERVAL '2 hours 41 minutes'
    AND log_type = 'PNO'
    AND NOT enriched
    AND report_id NOT IN (SELECT referenced_report_id FROM deleted_corrected_or_rejected_messages)

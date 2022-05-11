WITH fars_received_between_dates AS (
    SELECT
        cfr,
        (jsonb_array_elements(value->'hauls')->>'farDatetimeUtc')::TIMESTAMP AS fishing_operation_datetime_utc
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= :declaration_min_datetime_utc AND
        operation_datetime_utc < :declaration_max_datetime_utc AND
        report_datetime_utc >= :declaration_min_datetime_utc AND
        report_datetime_utc < :declaration_max_datetime_utc AND
        log_type = 'FAR'
)

SELECT DISTINCT cfr
FROM fars_received_between_dates
WHERE
    fishing_operation_datetime_utc >= :fishing_operation_min_datetime_utc AND
    fishing_operation_datetime_utc < :fishing_operation_max_datetime_utc
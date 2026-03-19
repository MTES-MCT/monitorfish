SELECT DISTINCT ON (cfr, report_id)
    cfr,
    report_id,
    report_datetime_utc,
    predicted_arrival_datetime_utc
FROM monitorfish.pnos
WHERE
    predicted_arrival_datetime_utc >= {from_datetime_utc:DateTime}
    AND flag_state = 'FRA'
    AND prior_notification_source = 'MANUAL'
ORDER BY cfr, trip_number, report_datetime_utc DESC
SELECT DISTINCT ON (cfr, trip_number)
    cfr,
    trip_number,
    report_datetime_utc::DateTime64 AS report_datetime_utc,
    predicted_arrival_datetime_utc::DateTime64 AS predicted_arrival_datetime_utc
FROM monitorfish.pnos
WHERE
    predicted_arrival_datetime_utc >= {from_datetime_utc:DateTime}
    AND flag_state = 'FRA'
    AND prior_notification_source = 'LOGBOOK'
    AND trip_number IS NOT NULL
ORDER BY cfr, trip_number, report_datetime_utc DESC
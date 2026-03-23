SELECT
    cfr,
    report_id,
    report_datetime_utc::DateTime64 AS report_datetime_utc,
    predicted_arrival_datetime_utc::DateTime64 AS predicted_arrival_datetime_utc
FROM monitorfish.pnos
WHERE
    predicted_arrival_datetime_utc >= {from_datetime_utc:DateTime}
    AND flag_state = 'FRA'
    AND prior_notification_source = 'MANUAL'
GROUP BY 1, 2, 3, 4
HAVING SUM(weight) > 0
ORDER BY cfr, report_datetime_utc
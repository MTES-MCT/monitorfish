SELECT
    MIN((r.value->>'tripStartDate')::TIMESTAMPTZ) AS min_trip_start_date,
    MAX((r.value->>'predictedArrivalDatetimeUtc')::TIMESTAMPTZ) AS max_predicted_arrival_datetime_utc
FROM logbook_reports r
WHERE
    operation_datetime_utc >= :pno_emission_start_datetime_utc
    AND operation_datetime_utc <= :pno_emission_end_datetime_utc
    AND log_type = 'PNO'
    AND NOT enriched

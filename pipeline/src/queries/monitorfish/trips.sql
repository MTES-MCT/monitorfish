SELECT cfr, trip_number, start_datetime_utc, end_datetime_utc
FROM trips_snapshot
WHERE start_datetime_utc >= :from_datetime_utc
ORDER BY cfr, trip_number

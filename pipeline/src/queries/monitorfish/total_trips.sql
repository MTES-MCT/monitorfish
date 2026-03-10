SELECT cfr, COUNT(*) AS total_trips
FROM trips_snapshot
WHERE start_datetime_utc >= :from_datetime_utc
GROUP BY cfr
ORDER BY 2 DESC
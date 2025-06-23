SELECT DISTINCT cfr, gear, mesh
FROM monitorfish.enriched_catches
WHERE
    far_datetime_utc >= {profile_datetime_utc:DateTime} - toIntervalDay({duration_in_days:Integer})
    AND far_datetime_utc < {profile_datetime_utc:DateTime}
    AND weight > 0

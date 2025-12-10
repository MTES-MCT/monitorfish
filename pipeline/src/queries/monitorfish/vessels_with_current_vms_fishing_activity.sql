SELECT DISTINCT internal_reference_number AS cfr
FROM positions
WHERE
    date_time >= NOW() AT TIME ZONE 'UTC' - INTERVAL '48 hours' AND
    date_time <= NOW() AT TIME ZONE 'UTC' AND
    is_fishing AND
    EXTRACT(epoch FROM NOW() AT TIME ZONE 'UTC' - date_time) / 3600 < time_emitting_at_sea
    AND internal_reference_number IS NOT NULL
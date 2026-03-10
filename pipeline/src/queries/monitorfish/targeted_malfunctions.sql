SELECT
    bm.internal_reference_number AS cfr,
    COUNT(DISTINCT bm.id) AS occurrences
FROM beacon_malfunction_actions bma
JOIN beacon_malfunctions bm
ON bm.id = bma.beacon_malfunction_id
WHERE
    property_name = 'STAGE' AND
    next_value = 'TARGETING_VESSEL' AND
    date_time_utc >= :from_datetime_utc
GROUP BY 1
ORDER BY 2 DESC
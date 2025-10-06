SELECT
    internal_reference_number,
    external_reference_number,
    ircs,
    MAX(silenced_before_date) AT TIME ZONE 'UTC' AS silenced_before_date
FROM silenced_alerts
WHERE
    silenced_before_date > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL ':number_of_hours HOURS'
    AND value->>'type' = :alert_type
    AND (value->>'alertId')::INTEGER = :alert_id
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3
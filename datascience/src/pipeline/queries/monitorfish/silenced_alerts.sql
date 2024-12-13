SELECT DISTINCT
    internal_reference_number,
    external_reference_number,
    ircs
FROM silenced_alerts
WHERE
    silenced_before_date > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL ':number_of_hours HOURS'
    AND value->>'type' = :alert_type

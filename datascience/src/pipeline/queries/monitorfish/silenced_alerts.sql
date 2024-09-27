SELECT DISTINCT
    internal_reference_number,
    external_reference_number,
    ircs
FROM silenced_alerts
WHERE
    NOW() < silenced_before_date
    AND value->>'type' = :alert_type

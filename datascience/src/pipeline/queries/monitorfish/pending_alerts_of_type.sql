SELECT id
FROM pending_alerts
WHERE value->>'type' = :alert_type

SELECT
    internal_reference_number,
    external_reference_number,
    ircs,
    value->>'seaFront' as silenced_sea_front,
    value->>'type' as silenced_type
FROM silenced_alerts
WHERE NOW() < silenced_before_date AND
    (silenced_after_date IS NULL OR NOW() > silenced_after_date)
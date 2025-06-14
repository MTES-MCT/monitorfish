SELECT DISTINCT
    internal_reference_number,
    external_reference_number,
    ircs
FROM reportings
WHERE
    NOT archived
    AND NOT deleted
    AND value->>'type' = :alert_type

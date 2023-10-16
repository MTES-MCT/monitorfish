SELECT id
FROM reportings
WHERE value->>'type' = :reporting_type AND NOT archived

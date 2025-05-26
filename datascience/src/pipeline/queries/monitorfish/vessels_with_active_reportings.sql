SELECT DISTINCT internal_reference_number
FROM reportings
WHERE NOT archived AND NOT deleted AND internal_reference_number IS NOT NULL
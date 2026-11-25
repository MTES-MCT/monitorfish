SELECT
    satellite_operator_id,
    is_coastal,
    operator_is_up
FROM satellite_operators_statuses
ORDER BY 1, 2 DESC
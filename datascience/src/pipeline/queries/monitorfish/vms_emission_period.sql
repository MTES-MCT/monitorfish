-- Query to compute only emission periods, to be combined with last_positions table in case
-- to generate the enriched_last_positions, if computing the entire last_positions table
-- with last_positions.sql is computationnaly too expensive.

WITH last_54_hours_positions AS (
    SELECT 
        id,
        internal_reference_number,
        external_reference_number,
        date_time,
        ROW_NUMBER() OVER (
            PARTITION BY internal_reference_number, external_reference_number 
            ORDER BY date_time DESC) AS rk
    FROM positions
    WHERE date_time > CURRENT_TIMESTAMP - INTERVAL '2 days 6 hours'
    AND (internal_reference_number IS NOT NULL OR 
         external_reference_number IS NOT NULL)
),

emission_periods AS (SELECT
    COALESCE(internal_reference_number, '') AS internal_reference_number,
    COALESCE(external_reference_number, '') AS external_reference_number,
    (MAX(date_time) - MIN(date_time)) / NULLIF(COUNT(id) - 1, 0) AS emission_period
FROM last_54_hours_positions
WHERE rk <= 2
GROUP BY 
    internal_reference_number,
    external_reference_number
)

SELECT
    pos.*,
    per.emission_period
FROM public.last_positions pos
LEFT JOIN emission_periods per
ON pos.internal_reference_number = per.internal_reference_number
AND pos.external_reference_number = per.external_reference_number

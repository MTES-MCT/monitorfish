SELECT
    facade,
    segment,
    control_priority_level
FROM control_objectives
WHERE year = :year
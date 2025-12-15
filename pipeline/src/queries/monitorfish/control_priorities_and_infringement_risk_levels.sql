SELECT
    facade,
    segment,
    control_priority_level,
    infringement_risk_level
FROM control_objectives
WHERE year = :year
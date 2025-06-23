SELECT 
    cfr,
    control_rate_risk_factor,
    infraction_rate_risk_factor
FROM control_anteriority
WHERE cfr IS NOT NULL
ORDER BY cfr
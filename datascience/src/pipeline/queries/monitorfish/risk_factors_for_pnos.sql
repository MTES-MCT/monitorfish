SELECT 
    cfr,
    risk_factor
FROM risk_factors
WHERE cfr IS NOT NULL
ORDER BY cfr
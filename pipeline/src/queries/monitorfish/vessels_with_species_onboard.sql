SELECT cfr
FROM current_segments, jsonb_array_elements(species_onboard) AS catch
WHERE
    species_onboard != 'null'
    AND catch->>'species' IN :species_onboard
GROUP BY cfr
HAVING SUM((catch->>'weight')::DOUBLE PRECISION)  >= :min_weight
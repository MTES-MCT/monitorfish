SELECT
    cfr,
    catch->>'species' AS species,
    SUM((catch->>'weight')::DOUBLE PRECISION) AS weight
FROM current_segments, jsonb_array_elements(species_onboard) AS catch
WHERE
    species_onboard != 'null'
    AND catch->>'species' IN :species_onboard
GROUP BY 1, 2
WITH t AS (
    SELECT 
        COALESCE(vp.cfr,  cs.cfr) AS cfr,
        jsonb_array_elements(COALESCE(
            CASE WHEN cs.gear_onboard = 'null' THEN NULL ELSE cs.gear_onboard END,
            CASE WHEN vp.recent_gear_onboard = 'null' THEN NULL ELSE recent_gear_onboard END
        )) AS gear
    FROM vessel_profiles vp
    FULL OUTER JOIN current_segments cs
    ON cs.cfr = vp.cfr
)

SELECT
    cfr,
    gear->>'gear' AS gear,
    (gear->>'mesh')::DOUBLE PRECISION AS mesh
FROM t
WHERE gear->>'gear' IS NOT NULL
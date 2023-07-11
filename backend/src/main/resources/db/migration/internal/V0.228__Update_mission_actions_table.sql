WITH mission_actions_initial_gear_onboard AS (
    SELECT id, jsonb_array_elements(gear_onboard) AS gear_onboard
    FROM mission_actions
    WHERE NOT is_from_poseidon
),

mission_actions_updated_gear_onboard AS (
    SELECT 
        id,
        jsonb_agg(
            jsonb_set(
                gear_onboard, 
                '{hasUncontrolledMesh}',
                CASE
                    WHEN (gear_onboard->>'controlledMesh')::DOUBLE PRECISION IS NULL THEN 'true'::jsonb 
                    ELSE 'false'::jsonb 
                END,
                true
            )
        ) AS new_gear_onboard
    FROM mission_actions_initial_gear_onboard
    GROUP BY id
)

UPDATE public.mission_actions a
SET gear_onboard = u.new_gear_onboard
FROM mission_actions_updated_gear_onboard u
WHERE u.id = a.id;
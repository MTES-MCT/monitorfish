-- Fix Monitorfish land controls FAO areas : when missing, take area of the port
WITH controls_missing_fao_areas AS (
    SELECT
        id,
        p.fao_areas
    FROM mission_actions a
    JOIN ports p
    ON p.locode = a.port_locode
    WHERE
        action_type = 'LAND_CONTROL' AND
        NOT is_from_poseidon AND
        a.fao_areas = '{}'
)

UPDATE public.mission_actions ma
SET fao_areas = cmfa.fao_areas
FROM controls_missing_fao_areas cmfa
WHERE cmfa.id = ma.id;


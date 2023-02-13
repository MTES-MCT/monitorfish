CREATE VIEW public.analytics_controls AS

WITH controls_infraction_natinf AS (
    SELECT
        id,
        jsonb_array_elements(
            CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END
        )->>'natinf' AS infraction_natinf
    FROM mission_actions
    WHERE
        action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
        jsonb_array_length(
            CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END
        ) > 0
),

controls_infraction_natinfs_array AS (
    SELECT
        id,
        true AS infraction,
        ARRAY_AGG(infraction_natinf) AS infraction_natinfs
    FROM controls_infraction_natinf
    GROUP BY id
)

 SELECT
    a.id,
    vessel_id,
    mission_id,
    action_type AS control_type, -- changement 'Contrôle à la mer' en 'SEA_CONTROL'
    action_datetime_utc AS control_datetime_utc,
    CASE
        WHEN (facade IS NULL) THEN 'Hors façade'::character varying
        ELSE facade
    END AS facade,
    longitude,
    latitude,
    port_locode,
    vessel_targeted,
    inf.infraction,
    inf.infraction_natinfs,
    seizure_and_diversion,
    seizure_and_diversion_comments,
    other_comments,
    gear_onboard,
    species_onboard,
        CASE
            WHEN (
                segments = '[]' OR
                segments IS NULL OR
                segments = 'null'
            ) THEN '[{"segment": "Hors segment", "segmentName": "Hors segment"}]'
            ELSE segments
        END AS segments,
    fao_areas
    FROM mission_actions a
    LEFT JOIN controls_infraction_natinfs_array inf
    ON inf.id = a.id
    WHERE action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL');

DROP MATERIALIZED VIEW analytics_controls_full_data;

CREATE MATERIALIZED VIEW public.analytics_controls_full_data AS

WITH controls_gears AS (
    SELECT
        id,
        array_agg(COALESCE(gear->>'gearCode', 'Aucun engin')) AS gears
    FROM mission_actions
    LEFT JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(gear_onboard) = 'array'
        THEN gear_onboard ELSE '[]'
        END
    ) AS gear
    ON true
    WHERE action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') GROUP BY id
),

controls_species AS (
    SELECT
        id,
        array_agg(COALESCE(species->>'speciesCode', 'Aucune capture')) AS species
    FROM mission_actions
    LEFT JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(species_onboard) = 'array'
        THEN species_onboard ELSE '[]'
        END
    ) AS species
    ON true
    WHERE action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') GROUP BY id
),

action_infractions AS (
    SELECT
        id,
        jsonb_array_elements(
            CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END ||
            CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END
        ) AS mission_infraction
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

controls_infractions_details AS (
    SELECT
        id,
        mission_infraction->>'natinf' AS infraction_natinf,
        mission_infraction->>'infractionType' AS infraction_type
    FROM action_infractions
),

controls_infraction_natinf_category AS (
    SELECT
        controls_infractions_details.*,
        infractions.infraction_category
    FROM controls_infractions_details
    LEFT JOIN infractions
    ON infractions.natinf_code::VARCHAR = controls_infractions_details.infraction_natinf
),

controls_infraction_natinfs_array AS (
    SELECT
        id,
        true AS infraction,
        'Pêche' = ANY(ARRAY_AGG(infraction_category)) AS fishing_infraction,
       ARRAY_AGG(DISTINCT infraction_category) FILTER (WHERE infraction_category IS NOT NULL) AS infraction_categories,
       ARRAY_AGG(DISTINCT infraction_natinf) FILTER (WHERE infraction_natinf IS NOT NULL) AS infraction_natinfs,
       ARRAY_AGG(DISTINCT infraction_type) FILTER (WHERE infraction_type IS NOT NULL) AS infraction_types
    FROM controls_infraction_natinf_category
    GROUP BY id
)

SELECT
    a.id,
    a.vessel_id,
    a.mission_id,
    action_type AS control_type,
    action_datetime_utc AS control_datetime_utc,
    EXTRACT(year FROM action_datetime_utc) AS control_year,
    cu.name AS control_unit,
    adm.name AS administration,
    a.cfr,
    a.ircs,
    a.external_immatriculation,
    a.vessel_name,
    a.flag_state,
    a.district_code,
    COALESCE(a.facade, 'Hors façade') AS facade,
    COALESCE(a.longitude, ports.longitude) AS longitude,
    COALESCE(a.latitude, ports.latitude) AS latitude,
    port_locode,
    ports.region AS port_department,
    ports.port_name,
    vessel_targeted,
    COALESCE(inf.infraction, false) AS infraction,
    COALESCE(inf.fishing_infraction, false) AS fishing_infraction,
    COALESCE('WITH_RECORD' = ANY(inf.infraction_types), false) AS infraction_report,
    COALESCE(infraction_categories, '{Aucune infraction}'::VARCHAR[]) AS infraction_categories,
    COALESCE(infraction_natinfs, '{Aucune infraction}'::VARCHAR[]) AS infraction_natinfs,
    COALESCE(seizure_and_diversion, false) AS seizure_and_diversion,
    species,
    gears, 
    CASE WHEN a.fao_areas = '{}' THEN '{Aucune zone FAO}' ELSE a.fao_areas END AS fao_areas, 
    COALESCE(segment->>'segment', 'Hors segment') AS segment
FROM mission_actions a
LEFT JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(segments) = 'array' THEN segments ELSE '[]' END) AS segment on true
LEFT JOIN controls_infraction_natinfs_array inf ON inf.id = a.id
LEFT JOIN controls_gears ON controls_gears.id=a.id
LEFT JOIN controls_species ON controls_species.id=a.id
LEFT JOIN ports ON ports.locode = a.port_locode
JOIN analytics_missions m ON a.mission_id = m.id
LEFT JOIN analytics_missions_control_units mcu ON m.id = mcu.mission_id
LEFT JOIN analytics_control_units cu ON mcu.control_unit_id = cu.id
LEFT JOIN analytics_administrations adm ON cu.administration_id = adm.id
WHERE action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND NOT a.is_deleted AND NOT m.deleted
ORDER BY action_datetime_utc;

CREATE INDEX ON analytics_controls_full_data USING BRIN(control_datetime_utc);

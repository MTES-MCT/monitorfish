WITH all_vessels AS (
    SELECT
        cfr,
        external_immatriculation,
        ircs,
        gear_onboard,
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) AS geometry
    FROM last_positions
    WHERE cfr IS NOT NULL OR external_immatriculation IS NOT NULL OR ircs IS NOT NULL
),

vessels_with_gear AS (
    SELECT
        cfr,
        external_immatriculation,
        ircs,
        geometry,
        jsonb_array_elements(gear_onboard)->>'gear' AS gear_onboard
    FROM all_vessels
    WHERE gear_onboard != 'null'::jsonb
),

vessels_with_gear_grouped AS (
    SELECT
        cfr,
        external_immatriculation,
        ircs,
        geometry,
        ARRAY_AGG(gear_onboard) AS gear_onboard
    FROM vessels_with_gear
    GROUP BY 
        cfr,
        external_immatriculation,
        ircs,
        geometry
),

vessels_without_gear AS (
    SELECT
        cfr,
        external_immatriculation,
        ircs,
        geometry,
        NULL::VARCHAR[] AS gear_onboard
    FROM all_vessels
    WHERE gear_onboard = 'null'::jsonb
),

gear_onboard AS (
    SELECT * 
    FROM vessels_with_gear_grouped
    UNION ALL
    SELECT * 
    FROM vessels_without_gear
)

SELECT
    g.cfr,
    g.external_immatriculation,
    g.ircs,
    g.gear_onboard,
    v.declared_fishing_gears
FROM gear_onboard g
LEFT JOIN vessels v
ON g.cfr = v.cfr
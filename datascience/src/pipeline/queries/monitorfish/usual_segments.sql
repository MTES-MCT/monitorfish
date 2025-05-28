SELECT
    v.id AS vessel_id,
    p.cfr,
    v.ircs,
    v.external_immatriculation,
    p.gear_onboard,
    p.segments - 'NO_SEGMENT' AS segments,
    COALESCE(f.facade, latest_landing_facade) AS facade
FROM vessel_profiles p
LEFT JOIN vessels v
ON p.cfr = v.cfr
LEFT JOIN last_positions lp
ON
    lp.cfr = p.cfr AND
    lp.last_position_datetime_utc >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 YEAR' AND
    lp.last_position_datetime_utc < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '2 HOURS'
LEFT JOIN facade_areas_subdivided f
ON ST_Intersects(ST_SetSRId(ST_MakePoint(lp.longitude, lp.latitude), 4326), f.geometry)
WHERE p.segments != 'null' AND p.gear_onboard != 'null'
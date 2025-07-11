WITH fishing_efforts AS (
    SELECT
        p.internal_reference_number AS cfr,
        d.dml,
        COALESCE(p.flag_state, v.flag_state) AS flag_state,
        v.power * SUM(p.time_since_previous_position) AS fishing_effort_kwh
    FROM positions p
    LEFT JOIN vessels v
    ON v.cfr = p.internal_reference_number
    LEFT JOIN districts d
    ON d.district_code = v.district_code
    WHERE
        p.date_time >= DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '7 days'
        AND p.date_time < DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
        AND p.internal_reference_number IS NOT NULL
        AND p.flag_state = 'FR'
        AND v.length >= 12
        AND v.logbook_equipment_status = 'Equipé'
        AND p.is_fishing
    GROUP BY 1, 2, 3, v.power
    -- Minimum number of days with fishing activity
    HAVING COUNT(DISTINCT DATE_TRUNC('day', date_time)) >= 2
),

catches AS (
    SELECT
        lb.cfr,
        COALESCE(SUM(weight), 0) AS weight
    FROM logbook_reports lb
    LEFT JOIN jsonb_array_elements(lb.value->'hauls') haul ON true
    LEFT JOIN LATERAL (
        SELECT
            SUM((catch->>'weight')::DOUBLE PRECISION) AS weight
        FROM jsonb_array_elements(haul->'catches') catch
    ) catch_weight ON true
    WHERE
        lb.operation_datetime_utc >= DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '7 days'
        AND lb.activity_datetime_utc >= DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '7 days'
        AND lb.log_type = 'FAR'
    GROUP BY 1
)

SELECT
    fe.cfr,
    lp.external_immatriculation,
    lp.ircs,
    lp.vessel_id,
    lp.vessel_identifier,
    lp.vessel_name,
    f.facade,
    fe.dml,
    fe.flag_state,
    lp.risk_factor,
    DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '7 days' AS triggering_behaviour_datetime_utc,
    lp.latitude,
    lp.longitude
FROM fishing_efforts fe
JOIN catches c
ON fe.cfr = c.cfr
LEFT JOIN last_positions lp
ON lp.cfr = fe.cfr
LEFT JOIN facade_areas_subdivided f
ON ST_Intersects(ST_SetSRID(ST_Point(lp.longitude, lp.latitude), 4326), f.geometry)
WHERE c.weight < 0.015 * COALESCE(fe.fishing_effort_kWh, 0)
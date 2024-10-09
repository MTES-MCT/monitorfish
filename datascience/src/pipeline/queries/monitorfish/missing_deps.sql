WITH detected_recent_deps AS (
    SELECT
        p.internal_reference_number  AS cfr,
        v.length,
        p.date_time,
        p.latitude,
        p.longitude,
        f.facade,
        d.dml,
        COALESCE(p.flag_state, v.flag_state) AS flag_state,
        ROW_NUMBER() OVER (PARTITION BY p.internal_reference_number ORDER BY date_time DESC) AS dep_rank
    FROM positions p
    JOIN vessels v
    ON v.cfr = p.internal_reference_number
    LEFT JOIN facade_areas_subdivided f
    ON ST_Intersects(p.geometry, f.geometry)
    LEFT JOIN districts d
    ON d.district_code = v.district_code
    WHERE
        p.date_time >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '48 hours'
        AND p.date_time < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 hours'
        AND p.is_at_port = false
        AND time_emitting_at_sea = INTERVAL '0'
        AND p.flag_state = 'FR'
        AND v.length >= 12
        AND (v.logbook_equipment_status != 'Exempté' OR v.logbook_equipment_status IS NULL)
)

SELECT
    d.cfr,
    lp.external_immatriculation,
    lp.ircs,
    lp.vessel_id,
    lp.vessel_identifier,
    lp.vessel_name,
    d.facade,
    d.dml,
    d.flag_state,
    lp.risk_factor,
    d.latitude,
    d.longitude
FROM detected_recent_deps d
LEFT JOIN last_positions lp
ON lp.cfr = d.cfr
WHERE
    dep_rank = 1
    AND (
        (EXTRACT(epoch FROM date_time - departure_datetime_utc)) / 3600 > 6
        OR departure_datetime_utc IS NULL
    )
    AND NOT lp.is_at_port
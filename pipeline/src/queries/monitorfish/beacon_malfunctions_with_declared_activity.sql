WITH latest_activities AS (
    SELECT
        cfr,
        MAX(activity_datetime_utc) AS latest_activity_datetime_utc
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= :utcnow - INTERVAL '24 hours'
        AND operation_type = 'DAT'
        AND log_type IN ('DEP', 'FAR')
    GROUP BY cfr
)

SELECT DISTINCT ON (bm.id)
    bm.id,
    bm.is_followed,
    bm.internal_reference_number AS cfr,
    COALESCE(v.external_immatriculation, lp.external_immatriculation) AS external_immatriculation,
    COALESCE(v.ircs, lp.ircs) AS ircs,
    COALESCE(v.vessel_name, lp.vessel_name) AS vessel_name,
    COALESCE(v.flag_state, lp.flag_state) AS flag_state,
    'INTERNAL_REFERENCE_NUMBER' AS vessel_identifier,
    v.id AS vessel_id,
    d.dml,
    COALESCE(f.facade::text, d.facade) AS facade,
    lp.risk_factor,
    la.latest_activity_datetime_utc AS triggering_behaviour_datetime_utc
FROM beacon_malfunctions bm
JOIN latest_activities la ON la.cfr = bm.internal_reference_number
LEFT JOIN vessels v ON v.cfr = bm.internal_reference_number
LEFT JOIN last_positions lp ON lp.cfr = bm.internal_reference_number
LEFT JOIN districts d ON d.district_code = v.district_code
-- The sea front is derived from the vessel's last known position, falling back to
-- its district's sea front for vessels that never emitted (no last position). The
-- beacon malfunction's own coordinates are the last VMS emission, not where the
-- declared fishing activity took place, so they are not used here.
LEFT JOIN facade_areas_subdivided f
    ON ST_Intersects(ST_SetSRID(ST_Point(lp.longitude, lp.latitude), 4326), f.geometry)
WHERE
    bm.stage IN ('INITIAL_ENCOUNTER', 'AT_QUAY', 'FOLLOWING', 'TARGETING_VESSEL')
    AND bm.internal_reference_number IS NOT NULL
    AND la.latest_activity_datetime_utc > bm.vessel_status_last_modification_date_utc
ORDER BY bm.id

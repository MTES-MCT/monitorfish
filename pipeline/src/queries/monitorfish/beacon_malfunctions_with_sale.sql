WITH latest_sales AS (
    SELECT
        cfr,
        MAX(sales_datetime_utc) AS latest_sale_datetime_utc
    FROM sales_notes
    WHERE
        operation_datetime_utc >= :utcnow - INTERVAL '24 hours'
        AND operation_type = 'DAT'
        
    GROUP BY cfr
)

SELECT DISTINCT ON (bm.id)
    bm.id,
    bm.is_followed,
    bm.internal_reference_number AS cfr,
    COALESCE(bm.external_reference_number, v.external_immatriculation) AS external_immatriculation,
    COALESCE(bm.ircs, v.ircs) AS ircs,
    COALESCE(bm.vessel_name, v.vessel_name) AS vessel_name,
    COALESCE(bm.flag_state, v.flag_state) AS flag_state,
    'INTERNAL_REFERENCE_NUMBER' AS vessel_identifier,
    v.id AS vessel_id,
    d.dml,
    COALESCE(f.facade::text, d.facade) AS facade,
    rf.risk_factor,
    ls.latest_sale_datetime_utc AS triggering_behaviour_datetime_utc
FROM beacon_malfunctions bm
JOIN latest_sales ls ON ls.cfr = bm.internal_reference_number
LEFT JOIN vessels v ON v.cfr = bm.internal_reference_number
LEFT JOIN risk_factors rf ON rf.cfr = bm.internal_reference_number
LEFT JOIN districts d ON d.district_code = v.district_code
-- The sea front is derived from the vessel's last known position, falling back to
-- its district's sea front for vessels that never emitted (no last position). The
-- beacon malfunction's own coordinates are the last VMS emission, not where the
-- sale took place, so they are not used here.
LEFT JOIN facade_areas_subdivided f
    ON ST_Intersects(ST_SetSRID(ST_Point(bm.longitude, bm.latitude), 4326), f.geometry)
WHERE
    bm.stage IN ('INITIAL_ENCOUNTER', 'AT_QUAY', 'FOLLOWING', 'TARGETING_VESSEL')
    AND bm.internal_reference_number IS NOT NULL
    AND ls.latest_sale_datetime_utc > bm.vessel_status_last_modification_date_utc
ORDER BY bm.id

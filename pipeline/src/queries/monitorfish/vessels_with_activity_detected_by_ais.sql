SELECT DISTINCT ON (ais.cfr)
    ais.cfr,
    lp.external_immatriculation,
    lp.ircs,
    lp.vessel_name,
    lp.flag_state,
    f.facade,
    d.dml,
    lp.risk_factor,
    lp.vessel_identifier,
    ais.latitude,
    ais.longitude,
    lp.vessel_id,
    b.beacon_status,
    b.beacon_number,
    vms.last_position_datetime_utc AS vms_last_position_datetime_utc,
    ais.date_time AS triggering_behaviour_datetime_utc
FROM ais_positions_hourly ais
JOIN vessels v ON v.cfr = ais.cfr
JOIN beacons b ON b.vessel_id = v.id AND b.beacon_status = 'ACTIVATED'
LEFT JOIN last_positions_vms vms ON vms.cfr = ais.cfr
LEFT JOIN last_positions lp ON lp.cfr = ais.cfr
LEFT JOIN districts d ON d.district_code = v.district_code
LEFT JOIN facade_areas_subdivided f
    ON ST_Intersects(ST_SetSRID(ST_Point(lp.longitude, lp.latitude), 4326), f.geometry)
WHERE
    ais.cfr IS NOT NULL
    AND ais.date_time >= NOW() - INTERVAL '4 hours'
    AND ais.date_time < NOW() - INTERVAL '1 hour'
    AND (
        vms.last_position_datetime_utc IS NULL
        OR vms.last_position_datetime_utc < NOW() - INTERVAL '4 hours'
    )
ORDER BY ais.cfr, ais.date_time DESC

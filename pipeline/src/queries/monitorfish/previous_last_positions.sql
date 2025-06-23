SELECT
    pos.id,
    pos.cfr,
    pos.external_immatriculation,
    pos.mmsi,
    pos.ircs,
    pos.vessel_name,
    pos.flag_state,
    pos.district_code,
    pos.district,
    pos.registry_port,
    pos.width,
    pos.length,
    vessels.under_charter, 
    pos.latitude,
    pos.longitude,
    pos.speed,
    pos.course,
    pos.last_position_datetime_utc,
    pos.emission_period,
    pos.vessel_identifier,
    pos.is_at_port,
    pos.is_manual
FROM last_positions pos
LEFT JOIN vessels
ON pos.cfr = vessels.cfr
SELECT DISTINCT ON (mmsi)
    mmsi,
    date_time AT TIME ZONE 'UTC' AS last_position_datetime_utc,
    latitude,
    longitude,
    speed,
    course,
    status,
    imo,
    ship_type,
    destination,
    cfr,
    external_immatriculation,
    vessel_name,
    ircs,
    length
FROM ais_positions_hourly
WHERE date_time >= NOW() - INTERVAL '6 hours'
ORDER BY mmsi, date_time DESC;
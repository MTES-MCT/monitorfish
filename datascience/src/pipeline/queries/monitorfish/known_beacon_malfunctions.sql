SELECT
    m.id,
    m.beacon_number,
    m.vessel_status,
    b.satellite_operator_id
FROM beacon_malfunctions m
LEFT JOIN beacons b
ON m.beacon_number = b.beacon_number
WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')
SELECT
    id,
    beacon_number,
    vessel_status
FROM beacon_malfunctions
WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')
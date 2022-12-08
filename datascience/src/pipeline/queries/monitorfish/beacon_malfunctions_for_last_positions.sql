SELECT
    bm.id,
    b.vessel_id,
    bm.internal_reference_number AS cfr,
    bm.ircs,
    bm.external_reference_number AS external_immatriculation
FROM beacon_malfunctions bm
JOIN beacons b
ON b.beacon_number = bm.beacon_number
WHERE
    bm.stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED') AND
    b.beacon_status = 'ACTIVATED'
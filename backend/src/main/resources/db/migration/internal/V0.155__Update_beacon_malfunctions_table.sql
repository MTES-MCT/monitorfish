DELETE FROM public.beacon_malfunctions
WHERE
    vessel_id IS NULL AND
    stage IN (
        'INITIAL_ENCOUNTER',
        'FOUR_HOUR_REPORT',
        'RELAUNCH_REQUEST',
        'TARGETING_VESSEL',
        'CROSS_CHECK'
    )
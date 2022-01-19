DELETE FROM beacon_statuses;

INSERT INTO beacon_statuses (
    internal_reference_number,
    external_reference_number,
    ircs,
    vessel_name,
    vessel_identifier,
    vessel_status,
    stage,
    priority,
    malfunction_start_date_utc,
    malfunction_end_date_utc,
    vessel_status_last_modification_date_utc
) VALUES
(
    'ABC000542519', 
    'RO237719',
    'FQ7058', 
    'DEVINER FIGURE CONSCIENCE',
    'INTERNAL_REFERENCE_NUMBER',
    'AT_SEA',
    'RESUMED_TRANSMISSION',
    True,
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 month 3 days',
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 month',
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 month'
),
(
    NULL,
    'SB125334',
    'OLY7853',
    'JOUR INTÉRESSER VOILÀ',
    'IRCS',
    'NO_NEWS',
    'TARGETING_VESSEL',
    False,
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '10 hours',
    NULL,
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '4 hours'
);
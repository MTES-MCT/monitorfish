DELETE FROM beacons;

INSERT INTO public.beacons 
(           beacon_number, vessel_id,  beacon_status, satellite_operator_id,                                     logging_datetime_utc)
    VALUES
(                '987654',         1,  'DEACTIVATED',                     1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(                '123456',         2,    'ACTIVATED',                     1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(                'A56CZ2',         4,    'ACTIVATED',                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(   'BEACON_NOT_EMITTING',         5, 'UNSUPERVISED',                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(             'BEA951357',         6,    'ACTIVATED',                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days');
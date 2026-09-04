DELETE FROM beacons;

INSERT INTO public.beacons 
(           beacon_number, vessel_id, satellite_operator_id,                                     logging_datetime_utc)
    VALUES
(                '987654',      NULL,                     1,                                                     NULL),
(                '123456',         2,                     1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(                'A56CZ2',         4,                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(   'BEACON_NOT_EMITTING',      NULL,                     2,                                                     NULL),
(             'BEA951357',         6,                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(    'NEW_BEACON_ACT_DET',         8,                     1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days');
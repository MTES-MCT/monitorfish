DELETE FROM beacons;

INSERT INTO public.beacons 
(           beacon_number, vessel_id, satellite_operator_id,                                     logging_datetime_utc)
    VALUES
(                '987654',         1,                     1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(                '123456',         2,                     1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(                'A56CZ2',         4,                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(   'BEACON_NOT_EMITTING',         5,                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(             'BEA951357',         6,                     2, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days'),
(    'NEW_BEACON_ACT_DET',         8,                     1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 days');
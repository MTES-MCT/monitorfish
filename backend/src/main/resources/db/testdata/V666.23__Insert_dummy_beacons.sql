INSERT INTO public.beacons (
    beacon_number, vessel_id,  beacon_status, is_coastal, satellite_operator_id, logging_datetime_utc)
VALUES
    (   'FGEDX85',         1,    'ACTIVATED',      TRUE,                     1,    '2021-5-12 12:23'),
    (    '123456',         2,    'ACTIVATED',      FALSE,                     1,    '2021-4-22 22:25'),
    (    'ETETE4',         3,    'ACTIVATED',      FALSE,                     1,    '2021-3-20 12:38'),
    (    'A56CZ2',         4,    'ACTIVATED',      FALSE,                     2,    '2021-2-20 12:25'),
    (   'FEZFS65',         5, 'UNSUPERVISED',      FALSE,                     2,    '2021-1-12 10:47'),
    (   'LHGY122',         7,      'IN_TEST',      FALSE,                     2,    '2021-12-2 12:21'),
    (   'NB56FR8',         8,    'ACTIVATED',      FALSE,                     2,      '2021-6-2 9:23'),
    (   'PO8U9U4',         9,    'ACTIVATED',      FALSE,                     2,     '2021-5-2 12:27'),
    (   'ABC1234',      null,    'ACTIVATED',      FALSE,                     2,     '2021-5-1 12:20');

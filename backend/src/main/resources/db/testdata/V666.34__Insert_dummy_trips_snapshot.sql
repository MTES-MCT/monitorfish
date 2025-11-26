INSERT INTO trips_snapshot(
                cfr,                    trip_number,               start_datetime_utc,                 end_datetime_utc,            first_operation_datetime_utc,                      last_operation_datetime_utc) VALUES
    ('FAK000999999',                      '9463710',            '2018-08-30 12:41:00',            '2018-08-30 12:41:00',                   '2018-08-23 12:41:00',                            '2018-08-30 12:41:00'),
    ('U_W0NTFINDME',                      '9463711',            '2019-01-18 11:45:00',            '2019-01-18 11:45:00',                   '2018-02-17 01:05:00',                            '2019-01-18 11:45:00'),
    ('FAK000999999',                      '9463714',            '2019-02-27 01:05:00',            '2019-02-27 01:05:00',                   '2019-02-17 01:05:00',                            '2019-10-15 12:01:00'),
    ('UNKNOWN_VESS',                      '9463701',            '2018-02-17 01:05:00',            '2018-02-17 01:05:00',                   '2018-02-17 01:05:00',                            '2018-02-17 01:05:00'),
    ('FAK000999999',                      '9463713',            '2019-02-23 13:08:00',            '2019-02-23 13:08:00',                   '2019-01-18 11:45:00',                            '2019-02-23 13:08:00'),
    ('FAK000999999',                      '9463715',            '2019-10-11 01:40:00',            '2019-10-11 01:40:00',                   '2019-10-11 02:06:00', NOW() AT TIME ZONE 'UTC' - INTERVAL '15 minutes'),
    (     'SOCR4T3', 'SRC-TRP-TTT20200506194051795',            '2020-05-06 18:41:49',            '2020-05-06 18:41:49',                   '2020-05-06 18:39:33',                            '2020-05-06 18:41:49'),
    ( 'FR263454484',                     '20230086', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days',        CURRENT_DATE - INTERVAL '5 days',                 CURRENT_DATE - INTERVAL '5 days'),
    ( 'FR263454484',                     '20230087', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days',        CURRENT_DATE - INTERVAL '4 days',                 CURRENT_DATE - INTERVAL '3 days'),
    ( 'FR263454484', 'SRC-TRP-TTT20200506194051795', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days',        CURRENT_DATE - INTERVAL '2 days',                 CURRENT_DATE - INTERVAL '2 days');

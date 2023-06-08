DELETE FROM public.analytics_missions;

INSERT INTO public.analytics_missions
    (id, mission_types,     facade,                                                       start_datetime_utc,                                                   end_datetime_utc,                                                                                                                          geom,       deleted,  mission_source, closed, mission_order) VALUES
    ( 1,         '{"SEA"}', 'NAMO', CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 month 2 weeks 8 hours', CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 month 2 weeks',      ST_MPolyFromText('MULTIPOLYGON(((-1.7253 48.6075,-1.7253 48.6059,-1.6774 48.61,-1.6780 48.612,-1.7253 48.6075)))', 4326),    false, 'POSEIDON_CNSP',   true,          true),
    ( 2,        '{"LAND"}', 'NAMO',   CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 week 2 days 6 hours',   CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 week 2 days',      ST_MPolyFromText('MULTIPOLYGON(((-2.7253 49.6075,-2.7253 49.6059,-2.6774 49.61,-2.6780 49.612,-2.7253 49.6075)))', 4326),    false,   'MONITORFISH',   true,         false),
    ( 3,         '{"AIR"}', 'SA',          CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 day 12 hours',   CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 day 2 hours',      ST_MPolyFromText('MULTIPOLYGON(((-3.7253 50.6075,-3.7253 50.6059,-3.6774 50.61,-3.6780 50.612,-3.7253 50.6075)))', 4326),    false,   'MONITORFISH',   true,          true),
    ( 4,         '{"SEA"}', 'NAMO',         CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 month 8 hours',         CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 month', ST_MPolyFromText('MULTIPOLYGON(((-10.7253 48.6075,-10.7253 48.6059,-10.6774 48.61,-10.6780 48.612,-10.7253 48.6075)))', 4326),    true, 'POSEIDON_CNSP',   true,          true),
    ( 5,         '{"SEA"}', 'NAMO',          CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 week 6 hours',          CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 week', ST_MPolyFromText('MULTIPOLYGON(((-15.7253 49.6075,-15.7253 49.6059,-15.6774 49.61,-15.6780 49.612,-15.7253 49.6075)))', 4326),    false,   'MONITORFISH',   true,          NULL),
    ( 6, '{"SEA", "LAND"}', 'SA',                CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '10 hours',         CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 hours', ST_MPolyFromText('MULTIPOLYGON(((-20.7253 50.6075,-20.7253 50.6059,-20.6774 50.61,-20.6780 50.612,-20.7253 50.6075)))', 4326),    false,   'MONITORFISH',   true,          NULL),
    ( 7,         '{"AIR"}', 'NAMO',                 CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '8 hours',          CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 hour', ST_MPolyFromText('MULTIPOLYGON(((-10.7253 48.6075,-10.7253 48.6059,-10.6774 48.61,-10.6780 48.612,-10.7253 48.6075)))', 4326),    true,    'MONITORENV',   true,         false),
    ( 8,         '{"SEA"}', 'NAMO',                 CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '6 hours',                                                             NULL,  ST_MPolyFromText('MULTIPOLYGON(((-15.7253 49.6075,-15.7253 49.6059,-15.6774 49.61,-15.6780 49.612,-15.7253 49.6075)))', 4326),    false,   'MONITORFISH',  false,          true),
    ( 9,         '{"SEA"}', 'SA',                CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '10 hours',                                                             NULL,  ST_MPolyFromText('MULTIPOLYGON(((-20.7253 50.6075,-20.7253 50.6059,-20.6774 50.61,-20.6780 50.612,-20.7253 50.6075)))', 4326),    false,   'MONITORFISH',  false,         false);

INSERT INTO public.analytics_missions_control_units
    (id, mission_id, control_unit_id) VALUES
    ( 1,          1,               5),
    ( 2,          2,               2),
    ( 3,          3,               1),
    ( 4,          3,               5),
    ( 5,          4,               3),
    ( 6,          5,               4),
    ( 7,          6,               8),
    ( 8,          6,               3),
    ( 9,          7,               7),
    ( 10,         8,               6),
    ( 11,         9,               4);

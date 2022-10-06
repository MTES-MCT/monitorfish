DELETE FROM beacons;

INSERT INTO public.beacons (
    beacon_number,           vessel_id, beacon_status,  satellite_operator_id) VALUES
(   '987654',                1,         'DEACTIVATED',  1),
(   '123456',                2,         'ACTIVATED',    1),
(   'A56CZ2',                4,         'ACTIVATED',    2),
(   'BEACON_NOT_EMITTING',   5,         'UNSUPERVISED', 2),
(   'BEA951357',             6,         'ACTIVATED',    2);
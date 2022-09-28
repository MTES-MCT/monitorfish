CREATE TABLE public.beacons (
    beacon_number character varying(100) PRIMARY KEY,
    vessel_id integer NOT NULL,
    beacon_status public.beacon_status,
    satellite_operator_id integer
);
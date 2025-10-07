CREATE TABLE public.trips (
    cfr VARCHAR(12) NOT NULL,
    trip_sort_index INTEGER NOT NULL,
    is_last_trip BOOLEAN NOT NULL,
    trip_number VARCHAR(100) NOT NULL,
    departure_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    first_coe_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    last_cox_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    first_far_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    last_far_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    eof_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    return_to_port_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    end_of_landing_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    sort_order_datetime_utc TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX trips_cfr_idx ON public.trips USING btree (cfr);

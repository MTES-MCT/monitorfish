CREATE TABLE public.trips_snapshot (
    cfr VARCHAR(12) NOT NULL,
    trip_number VARCHAR(100) NOT NULL,
    sort_order_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    first_operation_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    last_operation_datetime_utc TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX trips_cfr_idx ON public.trips_snapshot USING btree (cfr);

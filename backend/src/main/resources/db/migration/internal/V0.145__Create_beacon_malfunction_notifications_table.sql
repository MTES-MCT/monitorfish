CREATE TYPE public.beacon_malfunction_notification_type AS ENUM (
    'MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION',
    'MALFUNCTION_AT_SEA_REMINDER',
    'MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION',
    'MALFUNCTION_AT_PORT_REMINDER',
    'END_OF_MALFUNCTION'
);

CREATE TYPE public.communication_means AS ENUM (
    'EMAIL',
    'SMS',
    'FAX'
);

CREATE TYPE public.recipient_function AS ENUM (
    'VESSEL_CAPTAIN',
    'VESSEL_OPERATOR',
    'SATELLITE_OPERATOR'
);

create table public.beacon_malfunction_notifications (
    id serial PRIMARY KEY,
    beacon_malfunction_id INTEGER NOT NULL,
    date_time_utc TIMESTAMP NOT NULL,
    notification_type beacon_malfunction_notification_type NOT NULL,
    communication_means communication_means NOT NULL,
    recipient_function recipient_function NOT NULL,
    recipient_name VARCHAR,
    recipient_address_or_number VARCHAR NOT NULL
);

CREATE INDEX beacon_malfunction_notifications_beacon_malfunction_id_idx ON public.beacon_malfunction_notifications (beacon_malfunction_id);

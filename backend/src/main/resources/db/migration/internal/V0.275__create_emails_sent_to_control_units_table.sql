CREATE TABLE public.emails_sent_to_control_units (
    id SERIAL PRIMARY KEY,
    control_unit_id INTEGER NOT NULL,
    control_unit_name VARCHAR NOT NULL,
    email_address VARCHAR NOT NULL,
    sending_datetime_utc TIMESTAMP NOT NULL,
    actions_min_datetime_utc TIMESTAMP NOT NULL,
    actions_max_datetime_utc TIMESTAMP NOT NULL,
    number_of_actions INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_code INTEGER,
    error_message VARCHAR
);
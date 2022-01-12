create table beacon_status_actions (
    id serial,
    beacon_status_id int not null,
    property_name string not null,
    previous_value string not null,
    next_value string not null,
    date_time_utc timestamp with time zone not null
);

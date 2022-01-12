create table beacon_status_actions (
    id serial,
    beacon_status_id int not null,
    property_name varchar(200) not null,
    previous_value varchar(200) not null,
    next_value varchar(200) not null,
    date_time_utc timestamp with time zone not null
);

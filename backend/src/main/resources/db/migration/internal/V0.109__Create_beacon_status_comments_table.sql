create table beacon_status_comments
(
    id               serial,
    beacon_status_id int                      not null,
    comment          text                     not null,
    user_type        varchar(5)               not null,
    date_time_utc    timestamp with time zone not null
);

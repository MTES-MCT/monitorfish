create table if not exists last_positions
(
    internal_reference_number varchar(100),
    external_reference_number varchar(100),
    mmsi                      varchar(100),
    ircs                      varchar(100),
    vessel_name               varchar(100),
    flag_state                varchar(100),
    from_country              varchar(100),
    destination_country       varchar(100),
    trip_number               integer,
    latitude                  double precision not null,
    longitude                 double precision not null,
    speed                     double precision not null,
    course                    double precision not null,
    date_time                 timestamp,
    position_type             varchar(100),
    unique (internal_reference_number, external_reference_number)
);

CREATE TABLE last_positions_ais (
  mmsi                          BIGINT PRIMARY KEY,
  ircs                          VARCHAR(100),
  external_immatriculation      VARCHAR(100),
  destination                   TEXT,
  vessel_name                   VARCHAR(100),
  flag_state                    VARCHAR(100),
  latitude                      DOUBLE PRECISION NOT NULL,
  longitude                     DOUBLE PRECISION NOT NULL,
  speed                         DOUBLE PRECISION,
  course                        DOUBLE PRECISION,
  status                        TEXT,
  last_position_datetime_utc    TIMESTAMP WITH TIME ZONE NOT NULL,
  length                        DOUBLE PRECISION,
  is_at_port                    BOOLEAN NOT NULL DEFAULT FALSE,
  imo                           VARCHAR(100),
  ship_type                     INTEGER
);

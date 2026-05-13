CREATE TABLE ais_positions (
  mmsi          BIGINT                   NOT NULL,
  date_time     TIMESTAMP WITH TIME ZONE NOT NULL,
  latitude      DOUBLE PRECISION         NOT NULL,
  longitude     DOUBLE PRECISION         NOT NULL,
  speed         DOUBLE PRECISION,
  course        DOUBLE PRECISION,
  status        TEXT,
  imo           VARCHAR(100),
  ship_type     INTEGER,
  destination              VARCHAR(100),
  cfr                      VARCHAR(100),
  external_immatriculation VARCHAR(100),
  vessel_name              VARCHAR(100),
  ircs                     VARCHAR(100),
  flag_state               VARCHAR(100),
  PRIMARY KEY (mmsi, date_time)
);

SELECT create_hypertable('ais_positions', by_range('date_time', INTERVAL '1 day'), if_not_exists => TRUE);
CREATE INDEX ON ais_positions (mmsi, date_time DESC);

CREATE TYPE beacon_malfunction_initial_location AS ENUM ('AT_SEA', 'AT_PORT');

ALTER TABLE beacon_malfunctions
    ADD COLUMN beacon_malfunction_initial_location beacon_malfunction_initial_location NOT NULL DEFAULT 'AT_SEA';

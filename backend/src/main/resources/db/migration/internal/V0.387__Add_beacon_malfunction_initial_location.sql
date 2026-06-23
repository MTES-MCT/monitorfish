ALTER TABLE beacon_malfunctions
    ADD COLUMN is_followed BOOLEAN NOT NULL DEFAULT true;

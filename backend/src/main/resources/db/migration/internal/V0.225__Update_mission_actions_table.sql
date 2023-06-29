-- We don't need to migrate the existing data here since there is no real production data yet.

ALTER TABLE mission_actions
    ADD COLUMN has_some_gears_seized BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE mission_actions
    ADD COLUMN has_some_species_seized boolean NOT NULL DEFAULT FALSE;

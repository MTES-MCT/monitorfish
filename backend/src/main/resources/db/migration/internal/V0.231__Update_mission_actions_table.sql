-- We don't need to migrate the existing data here since there is no real production data yet.

ALTER TABLE mission_actions
    ADD COLUMN closed_by VARCHAR;

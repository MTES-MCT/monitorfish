ALTER TABLE mission_actions
    ADD COLUMN is_deleted boolean NOT NULL DEFAULT FALSE;

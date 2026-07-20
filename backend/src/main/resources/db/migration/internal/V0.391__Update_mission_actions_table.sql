ALTER TABLE mission_actions ADD COLUMN vessel_groups JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE mission_actions ADD COLUMN trip_reportings JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE mission_actions ADD COLUMN is_prioritized BOOLEAN NOT NULL DEFAULT FALSE;

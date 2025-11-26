DROP MATERIALIZED VIEW IF EXISTS analytics_controls_full_data;
DROP VIEW IF EXISTS analytics_controls;

ALTER TABLE
    mission_actions
ADD COLUMN
    infractions JSONB;

UPDATE
    mission_actions
SET
    infractions = CASE WHEN jsonb_typeof(logbook_infractions) = 'array' THEN logbook_infractions ELSE '[]' END ||
                  CASE WHEN jsonb_typeof(gear_infractions) = 'array' THEN gear_infractions ELSE '[]' END ||
                  CASE WHEN jsonb_typeof(species_infractions) = 'array' THEN species_infractions ELSE '[]' END ||
                  CASE WHEN jsonb_typeof(other_infractions) = 'array' THEN other_infractions ELSE '[]' END;

ALTER TABLE
    mission_actions
DROP COLUMN logbook_infractions,
DROP COLUMN gear_infractions,
DROP COLUMN species_infractions,
DROP COLUMN other_infractions;

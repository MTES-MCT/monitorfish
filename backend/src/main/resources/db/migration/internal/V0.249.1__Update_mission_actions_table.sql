CREATE TYPE mission_action_completion AS ENUM ('TO_COMPLETE', 'COMPLETED');

ALTER TABLE mission_actions ADD COLUMN completion mission_action_completion default 'TO_COMPLETE';

ALTER TABLE mission_actions
    RENAME COLUMN closed_by to completed_by;

-- Update `completion` column for past mission actions
UPDATE mission_actions
SET completion = 'COMPLETED'
WHERE
    action_type IN ('SEA_CONTROL', 'LAND_CONTROL', 'AIR_CONTROL') AND
    NULLIF(completed_by, '') IS NOT NULL;

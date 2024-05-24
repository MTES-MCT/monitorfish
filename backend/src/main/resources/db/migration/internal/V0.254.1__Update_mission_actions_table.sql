ALTER TABLE mission_actions
ALTER COLUMN user_trigram SET NOT NULL;

UPDATE mission_actions
SET flag_state = 'UNDEFINED'
WHERE
    flag_state IS NULL
    OR flag_state IN ('UNKNOWN', 'X');

UPDATE mission_actions
SET flag_state = upper(flag_state);

ALTER TABLE mission_actions
ALTER COLUMN flag_state SET NOT NULL;

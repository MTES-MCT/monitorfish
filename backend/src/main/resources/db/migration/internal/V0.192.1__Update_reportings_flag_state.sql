UPDATE reportings
    SET value = jsonb_set(value, '{flagState}', '"FR"')
    WHERE value->>'flagState' is null;

ALTER TABLE reportings
    ADD COLUMN flag_state varchar(2);

UPDATE reportings
   SET flag_state = r.value->>'flagState'
  FROM reportings r;

ALTER TABLE reportings
    ALTER COLUMN flag_state SET NOT NULL;

-- The flagState property of the legacy JSONB is no more used
UPDATE reportings
    SET value = value - 'flagState';

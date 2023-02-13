UPDATE silenced_alerts
    SET value = jsonb_set(value, '{flagState}', '"FR"')
    WHERE value->>'flagState' is null;

ALTER TABLE  silenced_alerts
    ADD COLUMN flag_state varchar(2);

UPDATE silenced_alerts
   SET flag_state = s.value->>'flagState'
  FROM silenced_alerts s;

ALTER TABLE silenced_alerts
    ALTER COLUMN flag_state SET NOT NULL;

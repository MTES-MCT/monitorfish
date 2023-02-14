UPDATE pending_alerts
    SET value = jsonb_set(value, '{flagState}', '"FR"')
    WHERE value->>'flagState' is null;

ALTER TABLE pending_alerts
    ADD COLUMN flag_state varchar(2);

UPDATE pending_alerts
   SET flag_state = p.value->>'flagState'
  FROM pending_alerts p;

ALTER TABLE pending_alerts
    ALTER COLUMN flag_state SET NOT NULL;

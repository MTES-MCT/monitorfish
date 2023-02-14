UPDATE silenced_alerts
   SET flag_state = value->>'flagState'
   WHERE value->>'flagState' is not null;

UPDATE pending_alerts
   SET flag_state = value->>'flagState';
   WHERE value->>'flagState' is not null

ALTER TABLE reportings
    ADD COLUMN flag_state varchar(2);

UPDATE reportings
   SET flag_state = value->>'flagState';

ALTER TABLE reportings
    ALTER COLUMN flag_state SET NOT NULL;

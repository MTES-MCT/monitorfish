UPDATE silenced_alerts
   SET flag_state = value->>'flagState';

UPDATE pending_alerts
   SET flag_state = value->>'flagState';

INSERT INTO beacon_malfunction_actions (beacon_malfunction_id, property_name, previous_value, next_value, date_time_utc) VALUES
(2,'STAGE','INITIAL_ENCOUNTER', 'RELAUNCH_REQUEST', NOW() - ('2 WEEK')::interval),
(2,'STAGE','RELAUNCH_REQUEST', 'FOUR_HOUR_REPORT', NOW() - ('1 WEEK')::interval),
(2,'VESSEL_STATUS','AT_SEA','NO_NEWS', NOW() - ('1 DAY')::interval),
(1,'VESSEL_STATUS', 'AT_PORT', 'TECHNICAL_STOP', NOW() - ('2 WEEK')::interval);

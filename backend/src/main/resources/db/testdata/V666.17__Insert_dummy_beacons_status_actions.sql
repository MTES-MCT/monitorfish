INSERT INTO beacon_status_actions (beacon_status_id, property_name, previous_value, next_value, date_time_utc) VALUES
(3,'STAGE','INITIAL_ENCOUNTER', 'RELAUNCH_REQUEST', NOW() - ('2 WEEK')::interval),
(3,'STAGE','RELAUNCH_REQUEST', 'FOUR_HOUR_REPORT', NOW() - ('1 WEEK')::interval),
(3,'VESSEL_STATUS','AT_SEA','NO_NEWS', NOW() - ('1 DAY')::interval),
(1,'VESSEL_STATUS', 'AT_PORT', 'TECHNICAL_STOP', NOW() - ('2 WEEK')::interval),
(2,'STAGE', 'INITIAL_ENCOUNTER', 'RESUMED_TRANSMISSION', NOW() - ('6 WEEK')::interval);

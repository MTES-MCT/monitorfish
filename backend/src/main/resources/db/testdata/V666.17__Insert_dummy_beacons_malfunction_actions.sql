INSERT INTO beacon_malfunction_actions (beacon_malfunction_id, property_name, previous_value, next_value, date_time_utc)
VALUES (3, 'STAGE', 'INITIAL_ENCOUNTER', 'AT_QUAY', NOW() - ('2 WEEK')::interval),
       (3, 'STAGE', 'AT_QUAY', 'FOUR_HOUR_REPORT', NOW() - ('1 WEEK')::interval),
       (3, 'VESSEL_STATUS', 'AT_SEA', 'NO_NEWS', NOW() - ('1 DAY')::interval),
       (1, 'VESSEL_STATUS', 'AT_PORT', 'ACTIVITY_DETECTED', NOW() - ('4 DAYS')::interval),
       (2, 'STAGE', 'INITIAL_ENCOUNTER', 'END_OF_MALFUNCTION', NOW() - ('6 WEEK')::interval);

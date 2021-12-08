INSERT INTO beacons_status (vessel_id, cfr, vessel_status, stage, priority, malfunction_start_date_utc, malfunction_end_date_utc, vessel_status_last_modification_date_utc) VALUES
(1, 'FAK000999999', 'AT_SEA', 'INITIAL_ENCOUNTER', true, NOW() - ('1 WEEK')::interval, null, NOW()),
(2, 'U_W0NTFINDME', 'NO_NEWS', 'FOUR_HOUR_REPORT', false, NOW() - ('2 WEEK')::interval, null, NOW() - ('1 WEEK')::interval),
(3, 'FR263418260', 'AT_PORT', 'INITIAL_ENCOUNTER', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval),
(4, '', 'AT_SEA', 'RELAUNCH_REQUEST', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval);

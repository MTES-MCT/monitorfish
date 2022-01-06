INSERT INTO beacons_status (internal_reference_number, ircs, external_reference_number, vessel_identifier, vessel_name, vessel_status, stage, priority, malfunction_start_date_utc, malfunction_end_date_utc, vessel_status_last_modification_date_utc) VALUES
('FAK000999999','CALLME','DONTSINK', 'INTERNAL_REFERENCE_NUMBER', 'PHENOMENE', 'AT_SEA', 'INITIAL_ENCOUNTER', true, NOW() - ('1 WEEK')::interval, null, NOW()),
('U_W0NTFINDME','QGDF','TALK2ME', 'IRCS','MALOTRU', 'NO_NEWS', 'FOUR_HOUR_REPORT', false, NOW() - ('2 WEEK')::interval, null, NOW() - ('1 WEEK')::interval),
('FR263418260','IR12A','08FR65324', 'EXTERNAL_REFERENCE_NUMBER','LE b@TO', 'AT_PORT', 'INITIAL_ENCOUNTER', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval),
('',null,'', null,'NO NAME', 'AT_SEA', 'RELAUNCH_REQUEST', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval);

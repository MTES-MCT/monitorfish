INSERT INTO beacon_malfunctions (internal_reference_number, ircs, external_reference_number, vessel_identifier, vessel_name, vessel_status, stage, priority, malfunction_start_date_utc, malfunction_end_date_utc, vessel_status_last_modification_date_utc) VALUES
('FAK000999999','CALLME','DONTSINK', 'INTERNAL_REFERENCE_NUMBER', 'PHENOMENE', 'TECHNICAL_STOP', 'INITIAL_ENCOUNTER', true, NOW() - ('1 WEEK')::interval, null, NOW()),
('U_W0NTFINDME','QGDF','TALK2ME', 'IRCS','MALOTRU', 'NO_NEWS', 'FOUR_HOUR_REPORT', false, NOW() - ('2 WEEK')::interval, null, NOW() - ('1 WEEK')::interval),
('FR263418260','IR12A','08FR65324', 'EXTERNAL_REFERENCE_NUMBER','LE b@TO', 'AT_PORT', 'INITIAL_ENCOUNTER', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval),
('FR263465414','IR123','08FR65465', 'EXTERNAL_REFERENCE_NUMBER','LE b@TO 2', 'AT_PORT', 'END_OF_FOLLOW_UP', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval),
('FR263454484','FE4864','8FR6541', 'EXTERNAL_REFERENCE_NUMBER','NO NAME', 'AT_SEA', 'RELAUNCH_REQUEST', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval),
('ABC000939217','SC6082','RU460262', 'INTERNAL_REFERENCE_NUMBER','FRAIS AVIS MODE', 'AT_SEA', 'INITIAL_ENCOUNTER', true, NOW() - ('3 WEEK')::interval, null, NOW() - ('2 WEEK')::interval),
('ABC000717263','QP6933','IG860866', 'INTERNAL_REFERENCE_NUMBER','ÉCRASER TON IMPOSSIBLE', 'AT_SEA', 'INITIAL_ENCOUNTER', true, NOW() - ('1 WEEK 5 DAYS')::interval, null, NOW() - ('1 WEEK 5 DAYS')::interval),
('ABC000480070','TR0588','ZQ658496', 'INTERNAL_REFERENCE_NUMBER','DURER REJETER RECONNAÎTRE', 'AT_PORT', 'INITIAL_ENCOUNTER', true, NOW() - ('1 WEEK 7 DAYS')::interval, null, NOW() - ('1 WEEK 6 DAYS')::interval),
('ABC000640738','IJU5217','EJ600773', 'INTERNAL_REFERENCE_NUMBER','PROFITER ESPRIT DEPUIS', 'AT_PORT', 'INITIAL_ENCOUNTER', true, NOW() - ('1 WEEK 3 DAYS')::interval, null, NOW() - ('1 WEEK 3 DAYS')::interval);

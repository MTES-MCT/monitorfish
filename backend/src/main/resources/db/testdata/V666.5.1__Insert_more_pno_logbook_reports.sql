INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_101');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_102');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_103');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_104');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_105');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_106');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_107');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_108');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_109');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_110');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_111');

INSERT INTO logbook_raw_messages (operation_number) VALUES ('FAKE_OPERATION_112');

INSERT INTO logbook_reports (id, cfr, enriched, integration_datetime_utc, log_type, operation_datetime_utc, operation_number, operation_type, report_datetime_utc, transmission_format, vessel_id, vessel_name, trip_gears, trip_segments, value) VALUES (101, 'FAK000999999', true, NOW() AT TIME ZONE 'UTC', 'PNO', NOW() AT TIME ZONE 'UTC', 'FAKE_OPERATION_101', 'DAT', NOW() AT TIME ZONE 'UTC', 'ERS', 1, 'PHENOMENE', '[{"gear":"GTR","mesh":100,"dimensions":"250;180"},{"gear":"GTR","mesh":120.5,"dimensions":"250;280"}]', '[{"segment":"NWW01","segment_name":"Chalutiers de fond"},{"segment":"PEL01","segment_name":"Chalutiers pélagiques"}]', '{"catchOnboard":[{"weight":25,"nbFish":null,"species":"SOL","faoZone":"27.8.a","effortZone":"C","economicZone":"FRA","statisticalRectangle":"23E6"}],"pnoTypes":[{"pnoTypeName":"Préavis type A","minimumNotificationPeriod":4,"hasDesignatedPorts":false},{"pnoTypeName":"Préavis type B","minimumNotificationPeriod":8,"hasDesignatedPorts":true}],"port":"FRSML","predictedArrivalDatetimeUtc":null,"predictedLandingDatetimeUtc":null,"purpose":"LAN","tripStartDate":null}');
UPDATE logbook_reports SET value = JSONB_SET(value, '{predictedArrivalDatetimeUtc}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' + INTERVAL '4 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 101;
UPDATE logbook_reports SET value = JSONB_SET(value, '{predictedLandingDatetimeUtc}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 101;
UPDATE logbook_reports SET value = JSONB_SET(value, '{tripStartDate}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' - INTERVAL '10 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 101;

INSERT INTO logbook_reports (id, cfr, enriched, integration_datetime_utc, log_type, operation_datetime_utc, operation_number, operation_type, report_datetime_utc, transmission_format, vessel_id, vessel_name, trip_gears, trip_segments, value) VALUES (102, 'ABC000042310', true, NOW() AT TIME ZONE 'UTC', 'PNO', NOW() AT TIME ZONE 'UTC', 'FAKE_OPERATION_102', 'DAT', NOW() AT TIME ZONE 'UTC', 'ERS', 10, 'COURANT MAIN PROFESSEUR', '[{"gear":"GTR","mesh":100,"dimensions":"250;180"},{"gear":"GTR","mesh":120.5,"dimensions":"250;280"}]', '[{"segment":"NWW01","segment_name":"Chalutiers de fond"},{"segment":"PEL01","segment_name":"Chalutiers pélagiques"}]', '{"catchOnboard":[{"weight":25,"nbFish":null,"species":"SOL","faoZone":"27.8.a","effortZone":"C","economicZone":"FRA","statisticalRectangle":"23E6"}],"pnoTypes":[{"pnoTypeName":"Préavis type C","minimumNotificationPeriod":4,"hasDesignatedPorts":false}],"port":"AEFRP","predictedArrivalDatetimeUtc":null,"predictedLandingDatetimeUtc":null,"purpose":"LAN","tripStartDate":null}');
UPDATE logbook_reports SET value = JSONB_SET(value, '{predictedArrivalDatetimeUtc}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' + INTERVAL '4 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 102;
UPDATE logbook_reports SET value = JSONB_SET(value, '{predictedLandingDatetimeUtc}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' + INTERVAL '5 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 102;
UPDATE logbook_reports SET value = JSONB_SET(value, '{tripStartDate}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' - INTERVAL '10 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 102;

INSERT INTO logbook_reports (id, enriched, integration_datetime_utc, log_type, operation_datetime_utc, operation_number, operation_type, report_datetime_utc, transmission_format, vessel_id, trip_gears, trip_segments, value) VALUES (103, true, NOW() AT TIME ZONE 'UTC', 'PNO', NOW() AT TIME ZONE 'UTC', 'FAKE_OPERATION_103', 'DAT', NOW() AT TIME ZONE 'UTC', 'ERS', -1, '[]', '[]', '{"catchOnboard":[],"pnoTypes":[],"port":"AEHZP","predictedArrivalDatetimeUtc":null,"purpose":"GRD","tripStartDate":null}');
UPDATE logbook_reports SET value = JSONB_SET(value, '{predictedArrivalDatetimeUtc}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 103;
UPDATE logbook_reports SET value = JSONB_SET(value, '{tripStartDate}', TO_JSONB(TO_CHAR(NOW() AT TIME ZONE 'UTC' - INTERVAL '10 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), true) WHERE id = 103;
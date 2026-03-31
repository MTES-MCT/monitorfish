-- Test data for getActiveTrips / findLastDepDatetimeOfCurrentTripsPerCfr

-- RTPTCFR01: trip closed with RTP within 6 months but outside the 24-hour window (caught by trip_rtp CTE)
-- RTPTCFR02: trip closed with RTP within the last 24 hours (caught by latest_trips CTE)
INSERT INTO trips_snapshot (cfr, trip_number, start_datetime_utc, end_datetime_utc, first_operation_datetime_utc, last_operation_datetime_utc)
VALUES ('RTPTCFR01', 'TRIP_RTP_01', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'),
       ('RTPTCFR02', 'TRIP_RTP_02', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '2 hours');

INSERT INTO logbook_raw_messages (operation_number, xml_message)
VALUES ('TEST_RTP_OP_01', '<xml/>'),
       ('TEST_RTP_OP_02', '<xml/>');

INSERT INTO logbook_reports (operation_number, trip_number, operation_country, operation_datetime_utc, operation_type,
                             report_id, referenced_report_id, report_datetime_utc,
                             cfr, ircs, external_identification, vessel_name, flag_state, imo, log_type,
                             activity_datetime_utc, value, integration_datetime_utc, transmission_format, software)
VALUES ('TEST_RTP_OP_01', 'TRIP_RTP_01', 'OOF', NOW() - INTERVAL '3 days', 'DAT',
        'TEST_RTP_OP_01', null, NOW() - INTERVAL '3 days',
        'RTPTCFR01', 'IRCS01', 'RTPEXT01', 'RTP TEST VESSEL 1', 'FRA', null, 'RTP',
        NOW() - INTERVAL '3 days',
        '{"port": "FRVNE", "reasonOfReturn": "LAN", "returnDatetimeUtc": "2024-01-01T00:00:00Z"}',
        NOW() - INTERVAL '3 days', 'ERS', 'TurboCatch (3.7-1)'),
       ('TEST_RTP_OP_02', 'TRIP_RTP_02', 'OOF', NOW() - INTERVAL '2 hours', 'DAT',
        'TEST_RTP_OP_02', null, NOW() - INTERVAL '2 hours',
        'RTPTCFR02', 'IRCS02', 'RTPEXT02', 'RTP TEST VESSEL 2', 'FRA', null, 'RTP',
        NOW() - INTERVAL '2 hours',
        '{"port": "FRVNE", "reasonOfReturn": "LAN", "returnDatetimeUtc": "2024-01-01T00:00:00Z"}',
        NOW() - INTERVAL '2 hours', 'ERS', 'TurboCatch (3.7-1)');

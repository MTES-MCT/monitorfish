DELETE FROM logbook_reports;
DELETE FROM logbook_raw_messages;

INSERT INTO logbook_raw_messages (operation_number) VALUES 
('1'),
('2'),
('3'),
('4'),
('5'),
('6'),
('7');

INSERT INTO logbook_reports (
    operation_number, operation_country, operation_datetime_utc, operation_type,
    report_id, referenced_report_id, report_datetime_utc, 
    cfr, ircs, external_identification, vessel_name, flag_state, imo, log_type, 
    value, 
    integration_datetime_utc, trip_number, transmission_format)
VALUES  
(
    '1', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '2 days')::TIMESTAMP, 'DAT', 
    '1', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '2 days')::TIMESTAMP,
    'ABC000306959', 'LLUK', 'RV348407', 'ÉTABLIR IMPRESSION LORSQUE', 'FRA', null, 'DEP',
    '{"gearOnboard": [{"gear": "OTM", "mesh": 80.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-27T01:05Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 23 hours 48 minutes')::TIMESTAMP, 20210001, 'ERS3'
),
(
    '2', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 6 hours')::TIMESTAMP, 'DAT', 
    '2', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 6 hours')::TIMESTAMP,
    'ABC000306959', 'LLUK', 'RV348407', 'ÉTABLIR IMPRESSION LORSQUE', 'FRA', null, 'FAR',
    '{"gear": "OTM", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 713.0, "faoZone": "27.8.a", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "23E6"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-21T17:45:00Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 23 hours 48 minutes')::TIMESTAMP, 20210001, 'ERS3'
),
(
    '3', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 5 days')::TIMESTAMP, 'DAT',
    '3', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 5 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'DEP',
    '{"gearOnboard": [{"gear": "OTB", "mesh": 80.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-27T01:05Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days 23 hours 48 minutes')::TIMESTAMP, 20210001, 'ERS3'
),
(
    '4', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days')::TIMESTAMP, 'DAT',
    '4', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'FAR',
    '{"gear": "OTB", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 713.0, "faoZone": "27.8.c", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-21T17:45:00Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, 20210001, 'ERS3'
),
(
    '5', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 5 days')::TIMESTAMP, 'DAT',
    '5', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 5 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'DEP',
    '{"gearOnboard": [{"gear": "OTB", "mesh": 80.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-27T01:05Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days 23 hours 48 minutes')::TIMESTAMP, 20210002, 'ERS3'
),
(
    '6', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 4 days')::TIMESTAMP, 'DAT',
    '6', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 4 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'FAR',
    '{"gear": "OTB", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 713.0, "faoZone": "27.8.c", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-21T17:45:00Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, 20210002, 'ERS3'
),
(
    '7', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 3 days')::TIMESTAMP, 'DAT',
    '7', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 3 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'FAR',
    '{"gear": "OTB", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 1713.0, "faoZone": "27.8.c", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}, {"nbFish": null, "weight": 157.0, "faoZone": "27.8.c", "species": "SOL", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-22T17:45:00Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, 20210002, 'ERS3'
);

UPDATE logbook_reports
SET value = jsonb_set(
    value, 
    '{departureDatetimeUtc}',
    ('"' || to_char(CURRENT_TIMESTAMP - INTERVAL '1 month 5 days', 'YYYY-MM-DD') || 'T' || to_char(CURRENT_TIMESTAMP - INTERVAL '1 week 5 days', 'HH24:MI:SS') || 'Z"')::jsonb
)
WHERE operation_number = '3';

UPDATE logbook_reports
SET value = jsonb_set(
    value, 
    '{departureDatetimeUtc}',
    ('"' || to_char(CURRENT_TIMESTAMP - INTERVAL '1 week 5 days', 'YYYY-MM-DD') || 'T' || to_char(CURRENT_TIMESTAMP - INTERVAL '1 week 5 days', 'HH24:MI:SS') || 'Z"')::jsonb
)
WHERE operation_number = '5';
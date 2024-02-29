DELETE FROM logbook_reports;
DELETE FROM logbook_raw_messages;

INSERT INTO logbook_raw_messages (operation_number, xml_message) VALUES 
    ('1', '<ERS>Message ERS xml</ERS>'),
    ('2', '<ERS>Message ERS xml</ERS>'),
    ('3', '<ERS>Message ERS xml</ERS>'),
    ('4', '<ERS>Message ERS xml</ERS>'),
    ('5', '<ERS>Message ERS xml</ERS>'),
    ('6', '<ERS>Message ERS xml</ERS>'),
    ('7', '<ERS>Message ERS xml</ERS>'),
    ('8', '<ERS>Message ERS xml</ERS>'),
    ('9', '<ERS>Message ERS xml</ERS>'),
    ('cc7ee632-e515-460f-a1c1-f82222a6d419', '<Flux>Message FLUX xml</Flux>'),
    ('a3c52754-97e1-4a21-ba2e-d8f16f4544e9', '<Flux>Message FLUX xml</Flux>'),
    ('d5c3b039-aaee-4cca-bcae-637fa8effe14', '<Flux>Message FLUX xml</Flux>'),
    ('7cfcdde3-286c-4713-8460-2ed82a59be34', '<Flux>Message FLUX xml</Flux>'),
    ('4f971076-e6c6-48f6-b87e-deae90fe4705', '<Flux>Message FLUX xml</Flux>'),
    ('8f06061e-e723-4b89-8577-3801a61582a2', '<Flux>Message FLUX xml</Flux>'),
    ('8db132d1-68fc-4ae6-b12e-4af594351701', '<Flux>Message FLUX xml</Flux>'),
    ('b509d82f-ce27-46c2-b5a3-d2bcae09de8a', '<Flux>Message FLUX xml</Flux>'),
    ('6c26236d-51ad-4aee-ac37-8e83978346a0', '<Flux>Message FLUX xml</Flux>'),
    ('81cf0182-db9c-4384-aca3-a75b1067c41a', '<Flux>Message FLUX xml</Flux>'),
    ('ab1058c7-b7cf-4345-a0b3-a9f472cc6ef6', '<Flux>Message FLUX xml</Flux>'),
    ('8826952f-b240-4570-a9dc-59f3a24c7bf1', '<Flux>Message FLUX xml</Flux>'),
    ('5ee8be46-2efe-4a29-b2df-bdf2d3ed66a1', '<Flux>Message FLUX xml</Flux>'),
    ('48794a8f-adfa-43b2-b4c3-2e8d3581bfb4', '<Flux>Message FLUX xml</Flux>'),
    ('196aca16-da66-4077-b340-ecad701be662', '<Flux>Message FLUX xml</Flux>'),
    ('4a4c8d24-f4be-4ccb-8aef-99ab5aae7e02', '<Flux>Message FLUX xml</Flux>'),
    ('251db84c-1d8b-49be-b426-f70bb2c68a2d', '<Flux>Message FLUX xml</Flux>'),
    ('08a125d6-6b6d-4f90-b26a-bf8426673eea', '<Flux>Message FLUX xml</Flux>'),
    ('9e38840b-f05a-49a4-ab34-e41131749fd0', '<Flux>Message FLUX xml</Flux>'),
    ('60e0d2e0-2713-43d7-9fa1-fcf968e34d82', '<Flux>Message FLUX xml</Flux>'),
    ('0e1ea2b6-f4f5-4958-bc48-cfb016a22f58', '<Flux>Message FLUX xml</Flux>'),
    ('3cffa378-0f8c-4540-b849-747621cfcb4a', '<Flux>Message FLUX xml</Flux>'),
    ('7bf7401d-cbb1-4e6f-bad8-7e309ee004cf', '<Flux>Message FLUX xml</Flux>'),
    ('9376ccbd-be2f-4d3d-b4ac-3c559ac9586a', '<Flux>Message FLUX xml</Flux>')
;

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
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 23 hours 48 minutes')::TIMESTAMP, '20210001', 'ERS'
),
(
    '2', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 6 hours')::TIMESTAMP, 'DAT', 
    '2', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 6 hours')::TIMESTAMP,
    'ABC000306959', 'LLUK', 'RV348407', 'ÉTABLIR IMPRESSION LORSQUE', 'FRA', null, 'FAR',
    '{"hauls": [{"gear": "OTM", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 713.0, "faoZone": "27.8.a", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "23E6"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-21T17:45:00Z"}]}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 23 hours 48 minutes')::TIMESTAMP, '20210001', 'ERS'
),
(
    '3', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 5 days')::TIMESTAMP, 'DAT',
    '3', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 5 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'DEP',
    '{"gearOnboard": [{"gear": "OTB", "mesh": 80.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-27T01:05Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days 23 hours 48 minutes')::TIMESTAMP, '20210001', 'ERS'
),
(
    '4', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days')::TIMESTAMP, 'DAT',
    '4', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'FAR',
    '{"hauls": [{"gear": "OTB", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 713.0, "faoZone": "27.8.c", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-21T17:45:00Z"}]}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, '20210001', 'ERS'
),
(
    '5', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 5 days')::TIMESTAMP, 'DAT',
    '5', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 5 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'DEP',
    '{"gearOnboard": [{"gear": "OTB", "mesh": 80.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-27T01:05Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 4 days 23 hours 48 minutes')::TIMESTAMP, '20210002', 'ERS'
),
(
    '6', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 4 days')::TIMESTAMP, 'DAT',
    '6', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 4 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'FAR',
    '{"hauls": [{"gear": "OTB", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 713.0, "faoZone": "27.8.c", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-21T17:45:00Z"}]}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, '20210002', 'ERS'
),
(
    '7', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 3 days')::TIMESTAMP, 'DAT',
    '7', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 3 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'FAR',
    '{"hauls": [{"gear": "OTB", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 1713.0, "faoZone": "27.8.c", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}, {"nbFish": null, "weight": 157.0, "faoZone": "27.8.c", "species": "SOL", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "16E4"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-22T17:45:00Z"}]}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, '20210002', 'ERS'
),
(
    '8', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 year 3 days')::TIMESTAMP, 'DAT',
    '8', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 year 3 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'PNO',
    '{"port": "PNO_PORT", "purpose": "LAN", "catchOnboard": [{"nbFish": null, "weight": 1500.0, "species": "GHL"}], "tripStartDate": "2020-05-04T19:41:03.340Z", "predictedArrivalDatetimeUtc": "2020-05-06T11:41:03.340Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, '20210000', 'ERS'
),
(
    '9', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 year 6 days')::TIMESTAMP, 'DAT',
    '9', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 year 6 days')::TIMESTAMP,
    'ABC000542519', 'FQ7058', 'RO237719', 'DEVINER FIGURE CONSCIENCE', 'FRA', null, 'LAN',
    '{"port": "LAN_PORT", "sender": null, "catchLanded": [{"nbFish": null, "weight": 100.0, "faoZone": "27.9.b.2", "species": "HAD", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "ESP", "presentation": "GUT", "conversionFactor": 1.2, "preservationState": "FRO", "statisticalRectangle": null}], "landingDatetimeUtc": "2020-05-05T19:41:26.516Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 3 days 23 hours 48 minutes')::TIMESTAMP, '20210000', 'ERS'
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


-- Add FLUX test data
INSERT INTO logbook_reports (
                       operation_number, operation_country, operation_datetime_utc, operation_type,                              report_id, referenced_report_id,   report_datetime_utc,       cfr,    ircs, external_identification, vessel_name, flag_state,       imo,  log_type,                    trip_number, transmission_format,     integration_datetime_utc, value) VALUES
('cc7ee632-e515-460f-a1c1-f82222a6d419',              null,  '2020-05-06 18:40:51',          'DAT', 'f006a2e5-0fdd-48a0-9a9a-ccae00d052d8',                 null, '2020-05-06 15:40:51', 'SOCR4T3', 'IRCS6',                 'XR006',      'GOLF',      'CYP', '1234567', 'NOT_COX', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.378408', '{"faoZoneExited": null, "latitudeExited": 57.7258, "longitudeExited": 0.5983, "effortZoneExited": null, "economicZoneExited": null, "targetSpeciesOnExit": null, "effortZoneExitDatetimeUtc": "2020-05-06T11:40:51.795Z", "statisticalRectangleExited": null}'),
('a3c52754-97e1-4a21-ba2e-d8f16f4544e9',              null,  '2020-05-06 18:40:57',          'DAT', '9d1ddd34-1394-470e-b8a6-469b86150e1e',                 null, '2020-05-06 15:40:57', 'SOCR4T3',    null,                    null,        null,      'CYP',      null,     'COX', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.384086', '{"faoZoneExited": null, "latitudeExited": 46.678, "longitudeExited": -14.616, "effortZoneExited": "A", "economicZoneExited": null, "targetSpeciesOnExit": null, "effortZoneExitDatetimeUtc": "2020-05-06T11:40:57.580Z", "statisticalRectangleExited": null}'),
('d5c3b039-aaee-4cca-bcae-637fa8effe14',              null,  '2020-05-06 18:41:03',          'DAT', '7ee30c6c-adf9-4f60-a4f1-f7f15ab92803',                 null, '2020-05-06 15:41:03', 'SOCR4T3',    null,                    null,        null,      'CYP',      null,     'PNO', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.38991' , '{"port": "GBPHD", "purpose": "LAN", "catchOnboard": [{"nbFish": null, "weight": 1500.0, "species": "GHL"}], "tripStartDate": "2020-05-04T19:41:03.340Z", "predictedArrivalDatetimeUtc": "2020-05-06T11:41:03.340Z"}'),
('7cfcdde3-286c-4713-8460-2ed82a59be34',              null,  '2020-05-06 18:41:09',          'DAT', 'fc16ea8a-3148-44b2-977f-de2a2ae550b9',                 null, '2020-05-06 15:41:09', 'SOCR4T3',    null,                    null,        null,      'CYP',      null,     'PNO', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.395805', '{"port": "GBPHD", "purpose": "SHE", "tripStartDate": "2020-05-04T19:41:09.200Z", "predictedArrivalDatetimeUtc": "2020-05-06T11:41:09.200Z"}'),
('4f971076-e6c6-48f6-b87e-deae90fe4705',              null,  '2020-05-06 18:41:15',          'DAT', 'cc45063f-2d3c-4cda-ac0c-8381e279e150',                 null, '2020-05-06 15:41:15', 'SOCR4T3',    null,                    null,      'GOLF',      'CYP',      null,     'RTP', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.401686', '{"port": "ESCAR", "reasonOfReturn": "REF", "returnDatetimeUtc": "2020-05-06T11:41:15.013Z"}'),
('8f06061e-e723-4b89-8577-3801a61582a2',              null,  '2020-05-06 18:41:20',          'DAT', 'dde5df56-24c2-4a2e-8afb-561f32113256',                 null, '2020-05-06 15:41:20', 'SOCR4T3', 'IRCS6',                 'XR006',        null,      'CYP',      null,     'RTP', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.407777', '{"port": "ESCAR", "gearOnboard": [{"gear": "GN", "mesh": 140.0, "dimensions": 1000.0}], "reasonOfReturn": "LAN", "returnDatetimeUtc": "2020-05-06T11:41:20.712Z"}'),
('8db132d1-68fc-4ae6-b12e-4af594351701',              null,  '2020-05-06 18:41:26',          'DAT', '83952732-ef89-4168-b2a1-df49d0aa1aff',                 null, '2020-05-06 15:41:26', 'SOCR4T3',    null,                    null,        null,      'CYP',      null,     'LAN', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.414081', '{"port": "ESCAR", "sender": null, "catchLanded": [{"nbFish": null, "weight": 100.0, "faoZone": "27.9.b.2", "species": "HAD", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "ESP", "presentation": "GUT", "conversionFactor": 1.2, "preservationState": "FRO", "statisticalRectangle": null}], "landingDatetimeUtc": "2020-05-05T19:41:26.516Z"}'),
('b509d82f-ce27-46c2-b5a3-d2bcae09de8a',              null,  '2020-05-06 18:41:32',          'DAT', 'ddf8f969-86f1-4eb9-a9a6-d61067a846bf',                 null, '2020-05-06 15:41:32', 'SOCR4T3',    null,                    null,        null,      'SVN',      null,     'TRA', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.420333', 'null'),
('6c26236d-51ad-4aee-ac37-8e83978346a0',              null,  '2020-05-06 18:41:38',          'DAT', 'b581876a-ae95-4a07-8b56-b6b5d8098a57',                 null, '2020-05-06 15:41:38', 'SOCR4T3',    null,                    null,        null,      'SVN',      null,     'TRA', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.426686', 'null'),
('81cf0182-db9c-4384-aca3-a75b1067c41a',              null,  '2020-05-06 18:41:43',          'DAT', 'ce5c46ca-3912-4de1-931c-d66b801b5362',                 null, '2020-05-06 15:41:43', 'SOCR4T3',    null,                    null,        null,      'CYP',      null, 'NOT_TRA', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.433052', 'null'),
('ab1058c7-b7cf-4345-a0b3-a9f472cc6ef6',              null,  '2020-05-06 18:41:49',          'DAT', 'e43c3bf0-163c-4fb0-a1de-1a61beb87988',                 null, '2020-05-06 15:41:49', 'SOCR4T3', 'IRCS6',                 'XR006',        null,      'CYP', '1234567', 'NOT_TRA', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.439501', 'null'),
('8826952f-b240-4570-a9dc-59f3a24c7bf1',              null,  '2020-05-06 18:39:33',          'DAT', '1e1bff95-dfff-4cc3-82d3-d72b46fda745',                 null, '2020-05-06 15:39:33', 'SOCR4T3',    null,                    null,      'GOLF',      'CYP', '1234567',     'DEP', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.501868', '{"gearOnboard": [{"gear": "PS", "mesh": 140.0, "dimensions": 14.0}], "departurePort": "ESCAR", "speciesOnboard": [{"nbFish": null, "weight": 50.0, "faoZone": "27.9.b.2", "species": "COD", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "ESP", "presentation": "GUT", "conversionFactor": 1.1, "preservationState": "FRO", "statisticalRectangle": null}], "anticipatedActivity": "FIS", "departureDatetimeUtc": "2020-05-06T11:39:33.176Z"}'),
('5ee8be46-2efe-4a29-b2df-bdf2d3ed66a1',              null,  '2020-05-06 18:39:40',          'DAT', '7712fe73-cef2-4646-97bb-d634fde00b07',                 null, '2020-05-06 15:39:40', 'SOCR4T3',    null,                    null,      'GOLF',      'CYP', '1234567',     'DEP', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.507524', '{"gearOnboard": [{"gear": "PS", "mesh": 140.0, "dimensions": 14.0}], "departurePort": "ESCAR", "anticipatedActivity": "FIS", "departureDatetimeUtc": "2020-05-06T11:39:40.722Z"}'),
('48794a8f-adfa-43b2-b4c3-2e8d3581bfb4',              null,  '2020-05-06 18:39:46',          'DAT', '2843bd5b-e4e7-4816-8372-76805201301e',                 null, '2020-05-06 15:39:46', 'SOCR4T3', 'IRCS6',                 'XR006',      'GOLF',      'CYP', '1234567', 'NOT_COE', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.513305', '{"latitudeEntered": 42.794, "longitudeEntered": -13.809, "faoZoneEntered": null, "effortZoneEntered": null, "economicZoneEntered": null, "targetSpeciesOnEntry": null, "effortZoneEntryDatetimeUtc": "2020-05-06T11:39:46.583Z", "statisticalRectangleEntered": null}'),
('196aca16-da66-4077-b340-ecad701be662',              null,  '2020-05-06 18:39:59',          'DAT', 'b2fca5fb-d1cd-4ec7-8a8c-645cecab6866',                 null, '2020-05-06 15:39:59', 'SOCR4T3',    null,                    null,        null,      'CYP',      null,     'FAR', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.519424', '{"hauls": [{"gear": "TBB", "mesh": 140.0, "catches": [{"nbFish": null, "weight": 1000.0, "faoZone": "27.8.e.1", "species": "COD", "effortZone": null, "economicZone": null, "statisticalRectangle": "21D5"}], "dimensions": 250.0, "farDatetimeUtc": "2020-05-06T11:39:59.462Z"}]}'),
('4a4c8d24-f4be-4ccb-8aef-99ab5aae7e02',              null,  '2020-05-06 18:40:05',          'DAT', '1a87f3de-dea9-4018-8c2e-d6cdfa97318e',                 null, '2020-05-06 15:40:05', 'SOCR4T3', 'IRCS6',                 'XR006',      'GOLF',      'CYP', '1234567',     'FAR', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.525832', '{"hauls": [{"gear": "TBB", "mesh": 140.0, "catches": [{"nbFish": null, "weight": 1000.0, "faoZone": "27.8.e.1", "species": "COD", "effortZone": null, "economicZone": null, "statisticalRectangle": "21D5"}], "dimensions": 250.0, "farDatetimeUtc": "2020-05-04T19:40:05.354Z"}, {"gear": "TBB", "mesh": 140.0, "catches": [{"nbFish": null, "weight": 600.0, "faoZone": "27.8.e.1", "species": "COD", "effortZone": null, "economicZone": null, "statisticalRectangle": "21D6"}], "dimensions": 250.0, "farDatetimeUtc": "2020-05-04T19:40:05.354Z"}]}'),
('251db84c-1d8b-49be-b426-f70bb2c68a2d',              null,  '2020-05-06 18:40:11',          'DAT', 'fe7acdb9-ff2e-4cfa-91a9-fd2e06b556e1',                 null, '2020-05-06 15:40:11', 'SOCR4T3',    null,                    null,        null,      'CYP',      null,     'FAR', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.531881', '{"hauls": [{"farDatetimeUtc": "2020-05-06T11:40:11.291Z"}]}'),
('08a125d6-6b6d-4f90-b26a-bf8426673eea',              null,  '2020-05-06 18:40:17',          'DAT', '74fcd0f7-8117-4791-9aa3-37d5c7dce880',                 null, '2020-05-06 15:40:17', 'SOCR4T3',    null,                    null,        null,      'SVN',      null,     'FAR', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.538061', '{"hauls": [{"catches": [{"nbFish": null, "weight": 0.0, "species": "BFT"}], "latitude": 39.65, "longitude": 6.83, "farDatetimeUtc": "2020-04-29T12:00:00.000Z"}]}'),
('9e38840b-f05a-49a4-ab34-e41131749fd0',              null,  '2020-05-06 18:40:22',          'DAT', '1706938b-c3c8-4d34-b32f-54c8d2c0705a',                 null, '2020-05-06 15:40:22', 'SOCR4T3', 'IRCS6',                 'XR006',      'GOLF',      'CYP', '1234567',     'FAR', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.544336', '{"hauls": [{"catches": [{"nbFish": null, "weight": 0.0, "faoZone": "27.8.e.1", "species": "MZZ", "effortZone": null, "economicZone": null, "statisticalRectangle": null}], "farDatetimeUtc": "2020-05-06T11:40:22.885Z"}]}'),
('60e0d2e0-2713-43d7-9fa1-fcf968e34d82',              null,  '2020-05-06 18:40:28',          'DAT', 'a36d23c5-b339-455d-9b0b-bf766a9d57d9',                 null, '2020-05-06 15:40:28', 'SOCR4T3', 'IRCS6',                 'XR006',      'GOLF',      'CYP', '1234567',     'JFO', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.550891', 'null'),
('0e1ea2b6-f4f5-4958-bc48-cfb016a22f58',              null,  '2020-05-06 18:40:34',          'DAT', 'a913a52e-5e66-4f40-8c64-148f90fa8cd9',                 null, '2020-05-06 15:40:34', 'SOCR4T3',    null,                    null,        null,      'CYP',      null,     'DIS', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.557299', '{"catches": [{"nbFish": null, "weight": 100.0, "species": "COD"}], "discardDatetimeUtc": "2020-05-06T11:40:34.449Z"}'),
('3cffa378-0f8c-4540-b849-747621cfcb4a',              null,  '2020-05-06 18:40:40',          'DAT', '7b487ada-019c-4b62-be32-7d15f7718344',                 null, '2020-05-06 15:40:40', 'SOCR4T3',    null,                    null,        null,      'CYP', '1234567',     'RLC', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.563768', 'null'),
('7bf7401d-cbb1-4e6f-bad8-7e309ee004cf',              null,  '2020-05-06 18:40:45',          'DAT', 'ced42f65-a1ac-40e1-93c7-851d4933f770',                 null, '2020-05-06 15:40:45', 'SOCR4T3',    null,                    null,      'GOLF',      'CYP',      null,     'RLC', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.570417', 'null'),
('9376ccbd-be2f-4d3d-b4ac-3c559ac9586a',              null,  '2021-01-31 12:29:02',          'DAT', '8eec0190-c353-4147-8a65-fcc697fbadbc',                 null, '2021-01-22 09:02:47', 'SOCR4T3',  'OPUF',                 'Z.510',    'Dennis',      'BEL',      null,     'COE', 'SRC-TRP-TTT20200506194051795',             'FLUX' , '2022-03-31 09:21:19.496049', '{"latitudeEntered": 51.333333, "longitudeEntered": 3.2, "faoZoneEntered": "27.4.c", "effortZoneEntered": null, "economicZoneEntered": "BEL", "targetSpeciesOnEntry": "DEMERSAL", "effortZoneEntryDatetimeUtc": "2021-01-22T09:00:00Z", "statisticalRectangleEntered": "31F3"}');


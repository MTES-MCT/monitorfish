DELETE FROM ers;
DELETE FROM ers_messages;

INSERT INTO ers_messages (operation_number) VALUES 
('1'),
('2');

INSERT INTO ers (
    operation_number, operation_country, operation_datetime_utc, operation_type,
    ers_id, referenced_ers_id, ers_datetime_utc, 
    cfr, ircs, external_identification, vessel_name, flag_state, imo, log_type, 
    value, 
    integration_datetime_utc, trip_number)
VALUES  
(
    '1', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '2 days')::TIMESTAMP, 'DAT', 
    '1', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '2 days')::TIMESTAMP,
    'ABC000306959', 'LLUK', 'RV348407', 'ÉTABLIR IMPRESSION LORSQUE', 'FRA', null, 'DEP',
    '{"gearOnboard": [{"gear": "OTM", "mesh": 80.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-27T01:05Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 23 hours 48 minutes')::TIMESTAMP, 20210001
),
(
    '2', 'OOF', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 6 hours')::TIMESTAMP, 'DAT', 
    '2', null, ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 6 hours')::TIMESTAMP,
    'ABC000306959', 'LLUK', 'RV348407', 'ÉTABLIR IMPRESSION LORSQUE', 'FRA', null, 'FAR',
    '{"gear": "OTM", "mesh": 80.0, "catches": [{"nbFish": null, "weight": 713.0, "faoZone": "27.8.a", "species": "HKE", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "FRA", "presentation": "GUT", "conversionFactor": 1.11, "preservationState": "FRE", "statisticalRectangle": "23E6"}], "latitude": 47.084, "longitude": -3.872, "dimensions": null, "farDatetimeUtc": "2018-07-21T17:45:00Z"}',
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 day 23 hours 48 minutes')::TIMESTAMP, 20210001
);

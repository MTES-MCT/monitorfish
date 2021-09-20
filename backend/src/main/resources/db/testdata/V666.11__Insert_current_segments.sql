insert into current_segments (cfr, last_ers_datetime_utc, departure_datetime_utc, trip_number, gear_onboard, species_onboard, segments, total_weight_onboard, probable_segments, risk_factor, control_priority_level) values
('FAK000999999',
 CURRENT_DATE,
 CURRENT_DATE,
 123456,
 '[{"gear": "OTB", "mesh": 70.0, "dimensions": 45.0}]',
 '[{ "gear": "OTB","faoZone": "27.8.b","species": "BLI","weight": 13.46 },{ "gear": "OTB","faoZone": "27.8.c","species": "HKE","weight": 235.6 }]',
 '{"NWW10", "PEL 03"}',
 1235.36,
 '{"NWW10", "PEL 03"}',
 3.025,
 2.56
);

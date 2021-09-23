insert into current_segments (cfr, last_ers_datetime_utc, departure_datetime_utc, trip_number, gear_onboard, species_onboard, segments, total_weight_onboard, probable_segments, impact_risk_factor, control_priority_level, segment_highest_impact, segment_highest_priority) values
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
 2.56,
 'NWW10',
 'PEL 03'
);

insert into control_anteriority (vessel_id, cfr, ircs, external_immatriculation, last_control_datetime_utc, last_control_infraction, post_control_comments, number_recent_controls, control_rate_risk_factor, infraction_score, infraction_rate_risk_factor, number_controls_last_5_years, number_controls_last_3_years, number_infractions_last_5_years, number_diversions_last_5_years, number_seizures_last_5_years, number_escorts_to_quay_last_5_years) values
(1,
 'FAK000999999',
 'CALLME',
 '',
 CURRENT_DATE,
 true,
 '',
 0,
 3.8,
 2.56,
 2.56,
 8,
 1,
 5,
 0,
 1,
 0);

insert into risk_factors (cfr, impact_risk_factor, probability_risk_factor, detectability_risk_factor, risk_factor) values
('FAK000999999', 2.1, 2, 3, 2.473);

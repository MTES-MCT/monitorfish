DELETE FROM risk_factors;

INSERT INTO risk_factors
(
    vessel_id, cfr, external_immatriculation, ircs,
    last_logbook_message_datetime_utc, departure_datetime_utc,
    trip_number, gear_onboard, species_onboard, segments, total_weight_onboard,
    last_control_datetime_utc, last_control_infraction, post_control_comments,
    impact_risk_factor, probability_risk_factor, detectability_risk_factor, risk_factor, 
    control_priority_level, control_rate_risk_factor, infraction_rate_risk_factor, infraction_score, 
    number_controls_last_3_years, number_controls_last_5_years, number_gear_seizures_last_5_years, number_species_seizures_last_5_years, number_infractions_last_5_years, number_recent_controls, number_vessel_seizures_last_5_years)
VALUES
(
    1, 'ABC000306959', 'RV348407', 'LLUK',
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '3 days', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '4 days',
    '20210001', '[{"gear": "OTM", "mesh": 80.0}]', '[{"gear": "OTB", "weight": 30.0, "faoZone": "27.7.d", "species": "SQZ"}, {"gear": "OTB", "weight": 30.0, "faoZone": "27.7.d", "species": "PLE"}, {"gear": "OTB", "weight": 20.0, "faoZone": "27.7.d", "species": "RJC"}]', '{"NWW01/02"}', 80.0,
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '6 months 6 days 6 hours', false, 'RAS',
    2.0, 3.0, 1.80277563773199, 2.14443662414848, 
    1.0, 3.25, 3.0, 17.0, 
    1.0, 2.0, 0.0, 0.0, 3.0, 0.0, 1.0
),
(
    2, 'ABC000542519', 'RO237719', 'FQ7058',
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 week 3 days', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 week 5 days',
    '20210002', '[{"gear": "OTB", "mesh": 80.0}]', '[{"gear": "OTB", "weight": 1930.0, "faoZone": "27.8.c", "species": "HKE"}]', '{}', 1930.0,
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 year 2 days', true, 'Pêche en zone interdite',
    3.3, 2.0, 1.80277563773199,  2.09885592141872,  
    1.0, 3.25, 2.0, 3.3,
    8.0, 13.0, 0.0, 0.0, 5.0, 3.0, 1.0
);
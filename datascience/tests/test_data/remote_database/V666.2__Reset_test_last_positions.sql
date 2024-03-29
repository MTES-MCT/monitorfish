DELETE FROM last_positions;

INSERT INTO last_positions (
    id,
    cfr, external_immatriculation, mmsi, ircs, vessel_name, flag_state, 
    trip_number, latitude, longitude, speed, course, 
    last_position_datetime_utc, emission_period, 
    last_logbook_message_datetime_utc, departure_datetime_utc, 
    width, length, registry_port, district, district_code, 
    gear_onboard, 
    segments, 
    species_onboard, total_weight_onboard, 
    last_control_datetime_utc, last_control_infraction, post_control_comments, 
    vessel_identifier, 
    estimated_current_latitude, estimated_current_longitude, 
    impact_risk_factor, probability_risk_factor, detectability_risk_factor, risk_factor, 
    under_charter, is_at_port, is_manual
) VALUES 
(
    13641745,
    'ABC000055481', 'AS761555', '365696479', 'IL2468', 'PLACE SPECTACLE SUBIR', 'NL',
    NULL, 53.4350000000000023, 5.55299999999999994, 2, 356, 
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 day', '0 days 00:30:00', 
    NULL, NULL, 
    NULL, 16.0500000000000007, NULL, 'Saint Marie-sur-Mer', NULL, 
    'null', 
    '{}', 
    'null', 0, 
    NULL, NULL, NULL, 
    'INTERNAL_REFERENCE_NUMBER',
    53.4417501798786034, 5.55220943397118027,
    1, 2, 2, 1.74110112659225003,
    false, false, false),
(
    13638407,
    'ABC000542519', 'RO237719', '291578411', 'FQ7058', 'DEVINER FIGURE CONSCIENCE', 'FR',
    '20210009', 43.3239999999999981, 5.35899999999999999, 0, 0, 
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 hour 10 minutes', '0 days 01:00:00', 
    '2021-07-21 12:29:00', '2021-07-19 21:34:00', 
    10, 48.0300000000000011, 'Bonneau-sur-Boucher', 'Blanchet-sur-Gallet', 'QI', 
    '[{"gear": "OTM", "mesh": 80.0, "dimensions": 1800.0}]', 
    '{}', 
    'null', 0, 
    '2019-09-11 11:41:00', false, 'TRANSPORT D ALEVINS  (2T)',
    'INTERNAL_REFERENCE_NUMBER',
    43.3239999999999981, 5.35899999999999999, 
    1, 1, 2, 1.41421356237310003,
    false, true, false),
(
    123456789,
    NULL, 'SB125334', NULL, 'OLY7853', 'JOUR INTÉRESSER VOILÀ', 'FR',
    NULL, -15.5250000000000004, -149.806000000000012, 0.200000000000000011, 201, 
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '10 hours', '0 days 00:04:00', 
    NULL, NULL, 
    NULL, NULL, NULL, NULL, NULL, 
    'null', 
    '{}', 
    'null', 0, 
    NULL, NULL, NULL, 
    'IRCS',
    NULL, NULL, 
    1, 2, 2, 1.74110112659225003,
    NULL, false, false),
(
    13740935,
    NULL, 'ZZTOPACDC', NULL, 'ZZ000000', 'I DO 4H REPORT', 'FR',
    NULL, -53.4249999999999972, -5.54900000000000038, 1.5, 195,
    (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '10 minutes', '0 days 04:00:00',
    NULL, NULL,
    NULL, NULL, NULL, NULL, NULL,
    'null',
    '{}',
    'null', 0,
    NULL, NULL, NULL,
    'IRCS',
    NULL, NULL,
    1, 2, 2, 1.74110112659225003,
    false, false, true
);
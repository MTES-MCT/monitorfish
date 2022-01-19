DELETE FROM vessels;

INSERT INTO public.vessels (
    id,
    cfr, external_immatriculation, mmsi, ircs, vessel_name, flag_state, width, length, 
    district, district_code, gauge, registry_port, power, vessel_type, sailing_category, sailing_type, 
    declared_fishing_gears, nav_licence_expiration_date, 
    vessel_emails, vessel_phones, proprietor_name, proprietor_phones, proprietor_emails, operator_name, operator_phones, operator_emails, 
    beacon_number, under_charter
) VALUES 
(  
    1,
    'ABC000306959', 'RV348407', NULL, 'LLUK', 'ÉTABLIR IMPRESSION LORSQUE', 'FR', 3.23, 17.4, 
    'Concarneau', 'CC', 4.1, 'Concarneau', 1016, 'Navire polyvalent', '3ème restreinte', 'Petite pêche', 
    '{GNS,GTR,LLS}', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP + INTERVAL '2 months',
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de poissons', '{1234567890,"06 06 06 06 06"}', '{write_to_me@gmail.com}', 
    NULL, false
),
(
    2,
    'ABC000542519', 'RO237719', NULL, 'FQ7058', 'DEVINER FIGURE CONSCIENCE', 'FR', 3.13, 11.4, 
    'Concarneau', 'CC', 3.7, 'Concarneau', 312, 'Navire polyvalent', '3ème restreinte', 'Petite pêche', 
    '{DRB,PS1}', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP + INTERVAL '3 months',
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de crevettes', '{9876543210}', '{address@email.bzh}', 
    123456, true
),
(
    3,
    'ABC000055481', 'AS761555', NULL, 'IL2468', 'PLACE SPECTACLE SUBIR', 'NL', 4.59, 21.5, 
    'Concarneau', 'CC', 3.7, 'Concarneau', 553, 'Chalutier', '4ème', 'Grande pêche', 
    '{OTM,OTB,OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de fonds', '{0000000000}', '{address@email.nl,address2@email.nl}',
    NULL, false
);
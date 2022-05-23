DELETE FROM vessels;

INSERT INTO public.vessels (
    id,
    cfr, external_immatriculation, mmsi, ircs, vessel_name, flag_state, width, length, 
    district, district_code, gauge, registry_port, power, vessel_type, sailing_category, sailing_type, 
    declared_fishing_gears, nav_licence_expiration_date, 
    vessel_emails, vessel_phones, proprietor_name, proprietor_phones, proprietor_emails, operator_name, operator_phones, operator_email, 
    beacon_number, under_charter, beacon_status
) VALUES 
(  
    1,
    'ABC000306959', 'RV348407', NULL, 'LLUK', 'ÉTABLIR IMPRESSION LORSQUE', 'FR', 3.23, 17.4, 
    'Concarneau', 'CC', 4.1, 'Concarneau', 1016, 'Navire polyvalent', '3ème restreinte', 'Petite pêche', 
    '{GNS,GTR,LLS}', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP + INTERVAL '2 months',
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de poissons', '{1234567890,"06 06 06 06 06"}', 'write_to_me@gmail.com', 
    NULL, false, NULL
),
(
    2,
    'ABC000542519', 'RO237719', NULL, 'FQ7058', 'DEVINER FIGURE CONSCIENCE', 'FR', 3.13, 13.4,
    'Concarneau', 'CC', 3.7, 'Concarneau', 312, 'Navire polyvalent', '3ème restreinte', 'Petite pêche', 
    '{DRB,PS1}', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP + INTERVAL '3 months',
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de crevettes', '{9876543210}', 'address@email.bzh', 
    123456, true, 'ACTIVATED'
),
(
    3,
    'ABC000055481', 'AS761555', NULL, 'IL2468', 'PLACE SPECTACLE SUBIR', 'NL', 4.59, 21.5, 
    'Concarneau', 'CC', 3.7, 'Concarneau', 553, 'Chalutier', '4ème', 'Grande pêche', 
    '{OTM,OTB,OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de fonds', '{0000000000}', 'address@email.nl',
    NULL, false, NULL
),
(
    4,
    NULL, 'SB125334', NULL, 'OLY7853', 'JOUR INTÉRESSER VOILÀ', 'FR', 4.59, 21.5, 
    'Brest', 'BR', 2.7, 'Brest', 453, 'Chalutier', '4ème', 'Grande pêche', 
    '{OTM,OTB,OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur', '{11111111111}', 'pecheur@poissecaille.fr',
    'A56CZ2', false, 'ACTIVATED'
),
(
    5,
    NULL, 'AB123456', NULL, 'AB654321', 'I NEVER EMITTED BUT SHOULD HAVE', 'FR', 4.19, 31.5, 
    'Marseille', 'MA', 2.7, 'Marseille', 451, 'Chalutier', '4ème', 'Grande pêche', 
    '{OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur qui se cache', '{2222222222}', 'discrete@cache-cache.fish',
    'BEACON_NOT_EMITTING', false, 'ACTIVATED'
),
(
    6,
    NULL, 'ZZTOPACDC', NULL, 'ZZ000000', 'I DO 4H REPORT', 'FR', 4.1, 12.5,
    'Marseille', 'MA', 2.7, 'Marseille', 250, 'Chalutier', '4ème', 'Grande pêche',
    '{OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur qui se fait ses 4h reports', '{3333333333}', 'reglo@bateau.fr',
    'BEA951357', false, 'ACTIVATED'
)
;
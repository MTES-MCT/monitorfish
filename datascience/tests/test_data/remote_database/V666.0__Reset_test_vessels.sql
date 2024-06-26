DELETE FROM vessels;

INSERT INTO public.vessels (
    id,
    cfr, external_immatriculation, mmsi, ircs, vessel_name, flag_state, width, length, 
    district, district_code, gauge, registry_port, power, vessel_type, sailing_category, sailing_type, 
    declared_fishing_gears, nav_licence_expiration_date, 
    vessel_emails, vessel_phones, proprietor_name, proprietor_phones, proprietor_emails, operator_name, operator_phones,     
    under_charter,
    operator_mobile_phone, vessel_mobile_phone, vessel_telex, vessel_fax, operator_fax, operator_email
) VALUES 
(  
    1,
    'ABC000306959', 'RV348407', NULL, 'LLUK', 'ÉTABLIR IMPRESSION LORSQUE', 'FR', 3.23, 17.4, 
    'Concarneau', 'CC', 4.1, 'Concarneau', 1016, 'Navire polyvalent', '3ème restreinte', 'Petite pêche', 
    '{GNS,GTR,LLS}', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP + INTERVAL '2 months',
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de poissons', '{1234567890,"06 06 06 06 06"}', 
    false,
    null, null, null, null, null, 'write_to_me@gmail.com'
),
(
    2,
    'ABC000542519', 'RO237719', NULL, 'FQ7058', 'DEVINER FIGURE CONSCIENCE', 'FR', 3.13, 13.4,
    'Concarneau', 'CC', 3.7, 'Concarneau', 312, 'Navire polyvalent', '3ème restreinte', 'Petite pêche', 
    '{DRB,PS1}', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP + INTERVAL '3 months',
    '{figure@conscience.fr, figure2@conscience.fr}', '{}', NULL, '{}', '{}', 'Le pêcheur de crevettes', '{9876543210}', 
    true,
    '0600000000', null, null, '0100000000', '0200000000', 'address@email.bzh'
),
(
    3,
    'ABC000055481', 'AS761555', NULL, 'IL2468', 'PLACE SPECTACLE SUBIR', 'NL', 4.59, 11.5,
    'Concarneau', 'CC', 3.7, 'Concarneau', 553, 'Chalutier', '4ème', 'Grande pêche', 
    '{OTM,OTB,OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur de fonds', '{0000000000}', 
    false,
    null, null, null, null, null, 'address@email.nl'
),
(
    4,
    NULL, 'SB125334', NULL, 'OLY7853', 'JOUR INTÉRESSER VOILÀ', 'FR', 4.59, 21.5, 
    'Brest', 'BR', 2.7, 'Brest', 453, 'Chalutier', '4ème', 'Grande pêche', 
    '{OTM,OTB,OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur', '{11111111111}', 
    false,
    null, '0111111111', null, null, null, 'pecheur@poissecaille.fr'
),
(
    5,
    NULL, 'AB123456', NULL, 'AB654321', 'I NEVER EMITTED BUT SHOULD HAVE', 'FR', 4.19, 31.5, 
    'Marseille', 'MA', 2.7, 'Marseille', 451, 'Chalutier', '4ème', 'Grande pêche', 
    '{OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur qui se cache', '{2222222222}', 
    false,
    null, null, null, null, null, 'discrete@cache-cache.fish'
),
(
    6,
    NULL, 'ZZTOPACDC', NULL, 'ZZ000000', 'I DO 4H REPORT', 'FR', 4.1, 12.5,
    'Marseille', 'MA', 2.7, 'Marseille', 250, 'Chalutier', '4ème', 'Grande pêche',
    '{OTT}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Le pêcheur qui se fait ses 4h reports', '{3333333333}', 
    false,
    null, null, null, null, null, 'reglo@bateau.fr'
),
(
    7,
    '___TARGET___', 'PNO_TARGET', NULL, 'TGT', 'I AM A CONTROL TARGET', 'FR', 2.1, 8.58,
    'Noirmoutier', 'NO', 1.7, 'Noirmoutier', 95, 'Ligneur', '2ème', 'Pêche côtière',
    '{LLS}', NULL,
    '{}', '{}', NULL, '{}', '{}', 'Pêchou', '{9546458753}',
    false,
    null, null, null, null, null, 'target@me'
)
;
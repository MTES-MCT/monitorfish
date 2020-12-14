INSERT INTO vessels (internal_reference_number, mmsi, ircs, vessel_name, flag_state, width, length, district, district_code, gauge,
                     registry_port, power, vessel_type, sailing_category, sailing_type,
                     declared_fishing_gears,
                     weight_authorized_on_deck, pinger, navigation_licence_expiration_date, shipowner_name,
                     shipowner_phones, shipowner_emails, fisher_name, fisher_phones, fisher_emails) VALUES
('FR209143000','224103750',null,'LA BOETIE','FR',5.0,12.89, 'Auray', 'AY', 123, 'LORIENT', 127, 'Pêche côtière', '3', 'Pêche', ARRAY['Trémail', 'Filets maillants calés'],  120, false, now() - random() * INTERVAL '5 hours', 'LE PELETIER', ARRAY['+33 6 84 56 32 14'], ARRAY['lepeletier@gmail.com'], 'EL MALIK', ARRAY['+33 6 45 25 14'], ARRAY['elmalik@gmail.com']),
('FR263418260','224103750',null,'LE b@TO','FR',6.0,14, 'Lorient', 'LT', 123, 'BREST', 237, 'Pêche côtière', '3', 'Pêche', ARRAY['Senne', 'Chalut de fond', 'Filets maillants calés'], 135, true,  now(), 'DUPOND', ARRAY['+33 6 84 56 32 14'], ARRAY['dupond@gmail.com'], 'DURAND', ARRAY['+33 6 45 25 14'], ARRAY['durand@gmail.com']);

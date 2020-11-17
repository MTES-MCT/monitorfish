INSERT INTO vessels (internal_reference_number, mmsi, ircs, vessel_name, flag_state, width, length, district, district_code, gauge,
                     registry_port, power, vessel_type, sailing_category, sailing_type,
                     declared_fishing_gear_main, declared_fishing_gear_secondary, declared_fishing_gear_third,
                     weight_authorized_on_deck, pinger, navigation_licence_expiration_date, shipowner_name,
                     shipowner_telephone_number, shipowner_email, fisher_name, fisher_telephone_number, fisher_email) VALUES
('FR209143000','224103750',null,'LA BOETIE','FR',5.0,12.89, 'Auray', 'AY', 123, 'LORIENT', 127, 'Pêche côtière', '3', 'Pêche', 'Trémail', 'Filets maillants calés', null, 120, false, now() - random() * INTERVAL '5 hours', 'LE PELETIER', '+33 6 84 56 32 14', 'lepeletier@gmail.com', 'EL MALIK', '+33 6 45 25 14', 'elmalik@gmail.com'),
('FR263418260','224103750',null,'LE b@TO','FR',6.0,14, 'Lorient', 'LT', 123, 'BREST', 237, 'Pêche côtière', '3', 'Pêche', 'Senne', 'Chalut de fond', 'Filets maillants calés', 135, true,  now(), 'DUPOND', '+33 6 84 56 32 14', 'dupond@gmail.com', 'DURAND', '+33 6 45 25 14', 'durand@gmail.com');

INSERT INTO vessels (id, cfr, mmsi, ircs, external_immatriculation, vessel_name, flag_state, width, length, district, district_code, gauge,
                     registry_port, power, vessel_type, sailing_category, sailing_type,
                     declared_fishing_gears,
                     weight_authorized_on_deck, nav_licence_expiration_date, shipowner_name,
                     shipowner_phones, shipowner_emails, fisher_name, fisher_phones, fisher_emails) VALUES
(1, 'GBR000B14430','224103750','MVGM5','AR865','CABO ORTEGAL','FR',5.0,12.89, 'Auray', 'AY', 123, 'LORIENT', 127, 'Pêche côtière', '3', 'Pêche', ARRAY['SDN', 'OTM'],  120, CURRENT_DATE, 'LE PELETIER', ARRAY['+33 6 84 56 32 14'], ARRAY['lepeletier@gmail.com'], 'EL MALIK', ARRAY['+33 6 45 25 14'], ARRAY['elmalik@gmail.com']),
(2, 'FRA000461560','GV461590','QGDF','GR56','BREIZH LORD','FR',5.0,12.89, 'Auray', 'AY', 123, 'LORIENT', 127, 'Pêche côtière', '3', 'Pêche', ARRAY['SDN', 'OTM'],  120, CURRENT_DATE, 'LE PELETIER', ARRAY['+33 6 84 56 32 14'], ARRAY['lepeletier@gmail.com'], 'EL MALIK', ARRAY['+33 6 45 25 14'], ARRAY['elmalik@gmail.com']),
(3, 'FR263418260','224103750','IR12A','08FR65324','LE b@TO','FR',6.0,14, 'Lorient', 'LT', 123, 'BREST', 237, 'Pêche côtière', '3', 'Pêche', ARRAY['SDN', 'OTB', 'LNB'], 135,  CURRENT_DATE, 'DUPOND', ARRAY['+33 6 84 56 32 14'], ARRAY['dupond@gmail.com'], 'DURAND', ARRAY['+33 6 45 25 14'], ARRAY['durand@gmail.com']);

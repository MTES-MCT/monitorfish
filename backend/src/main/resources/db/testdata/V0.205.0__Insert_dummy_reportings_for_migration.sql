TRUNCATE TABLE reportings RESTART IDENTITY CASCADE;

INSERT INTO reportings (type, vessel_name, internal_reference_number, external_reference_number, ircs,
                        vessel_identifier, flag_state, creation_date, validation_date, archived, deleted, value, latitude, longitude, vessel_id)
VALUES ('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
                                                           '"seaFront": "NAMO",' ||
                                                           '"riskFactor": 3.5647,' ||
                                                           '"type": "THREE_MILES_TRAWLING_ALERT",' ||
                                                           '"natinfCode": "7059"' ||
                                                           '}')::jsonb, 41.569, 37.28, null),
       ('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('3 DAY')::interval, NOW() - ('4 DAY')::interval, true, false, ('{' ||
                                                                                  '"seaFront": "NAMO",' ||
                                                                                  '"riskFactor": 3.3647,' ||
                                                                                  '"type": "THREE_MILES_TRAWLING_ALERT"' ||
                                                                                  '}')::jsonb, null, null, null),
       ('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('4 DAY')::interval, NOW() - ('5 DAY')::interval, true, true, ('{' ||
                                                                                  '"seaFront": "NAMO",' ||
                                                                                  '"riskFactor": 3.6947,' ||
                                                                                  '"type": "MISSING_FAR_ALERT",' ||
                                                                                  '"natinfCode": null' ||
                                                                                  '}')::jsonb, -5.569, 71.569, null),
       ('ALERT', 'PROMETTRE INTÉRIEUR SAINT', 'ABC000232227', 'ZJ472279', 'TMG5756', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
                                                           '"seaFront": "SA",' ||
                                                           '"riskFactor": 2.647,' ||
                                                           '"type": "TWELVE_MILES_FISHING_ALERT",' ||
                                                           '"natinfCode": ""' ||
                                                           '}')::jsonb, 1.123, -12.569, null),
       ('ALERT', 'HAÏR GAUCHE VIVRE', 'ABC000591595', 'HK498094', 'KF0313', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('2 DAY')::interval, NOW() - ('1 DAY')::interval, false, false, ('{' ||
                                                                                 '"seaFront": "MEMN",' ||
                                                                                 '"flagState": "FR",' ||
                                                                                 '"riskFactor": 1.389,' ||
                                                                                 '"type": "MISSING_FAR_ALERT",' ||
                                                                                 '"natinfCode": "27689"' ||
                                                                                 '}')::jsonb, null, null, null);

TRUNCATE TABLE reportings RESTART IDENTITY CASCADE;
INSERT INTO reportings (type, vessel_name, internal_reference_number, external_reference_number, ircs,
                        vessel_identifier, flag_state, creation_date, validation_date, archived, deleted, value, latitude, longitude, vessel_id)
VALUES ('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
                                                           '"seaFront": "NAMO",' ||
                                                           '"riskFactor": 3.5647,' ||
                                                           '"type": "THREE_MILES_TRAWLING_ALERT",' ||
                                                           '"natinfCode": 7059' ||
                                                           '}')::jsonb, 41.569, 37.28, 123456),
       ('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('3 DAY')::interval, NOW() - ('4 DAY')::interval, true, false, ('{' ||
                                                                                  '"seaFront": "NAMO",' ||
                                                                                  '"riskFactor": 3.3647,' ||
                                                                                  '"type": "THREE_MILES_TRAWLING_ALERT",' ||
                                                                                  '"natinfCode": 7059' ||
                                                                                  '}')::jsonb, null, null, 123456),
       ('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('4 DAY')::interval, NOW() - ('5 DAY')::interval, true, true, ('{' ||
                                                                                  '"seaFront": "NAMO",' ||
                                                                                  '"riskFactor": 3.6947,' ||
                                                                                  '"type": "MISSING_FAR_ALERT",' ||
                                                                                  '"natinfCode": 27689' ||
                                                                                  '}')::jsonb, -5.569, 71.569, 123456),
       ('ALERT', 'PROMETTRE INTÉRIEUR SAINT', 'ABC000232227', 'ZJ472279', 'TMG5756', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
                                                           '"seaFront": "SA",' ||
                                                           '"riskFactor": 2.647,' ||
                                                           '"type": "TWELVE_MILES_FISHING_ALERT",' ||
                                                           '"natinfCode": 2610' ||
                                                           '}')::jsonb, 1.123, -12.569, null),
       ('ALERT', 'HAÏR GAUCHE VIVRE', 'ABC000591595', 'HK498094', 'KF0313', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW() - ('2 DAY')::interval, NOW() - ('1 DAY')::interval, false, false, ('{' ||
                                                                                 '"seaFront": "MEMN",' ||
                                                                                 '"flagState": "FR",' ||
                                                                                 '"riskFactor": 1.389,' ||
                                                                                 '"type": "MISSING_FAR_ALERT",' ||
                                                                                 '"natinfCode": 27689' ||
                                                                                 '}')::jsonb, null, null, null),
       ('INFRACTION_SUSPICION', 'COURANT MAIN PROFESSEUR', 'ABC000042310', 'IW783219', 'QD0506',
        'INTERNAL_REFERENCE_NUMBER', 'FR', NOW() - ('1 DAY')::interval, NOW() - ('1 DAY')::interval, false, false, ('{' ||
                                                                                                              '"reportingActor": "OPS",' ||
                                                                                                              '"controlUnitId": null,' ||
                                                                                                              '"authorTrigram": "LTH",' ||
                                                                                                              '"authorContact": "",' ||
                                                                                                              '"title": "Suspicion de chalutage dans les 3 milles",' ||
                                                                                                              '"description": "Chalutage dans les 3 milles (vitesse & parcours pêche) le 22/08/22 à 22h56",' ||
                                                                                                              '"natinfCode": 23588,' ||
                                                                                                              '"dml": "DML 29",' ||
                                                                                                              '"type": "INFRACTION_SUSPICION",' ||
                                                                                                              '"seaFront": "NAMO"' ||
                                                                                                              '}')::jsonb, null, null, 10),
       ('INFRACTION_SUSPICION', 'RENCONTRER VEILLER APPARTEMENT"', 'ABC000597493', 'JL026591', 'CMQ7994',
        'INTERNAL_REFERENCE_NUMBER', 'FR', NOW() - ('1 DAY 1 HOUR')::interval, null, false,
        false, ('{' ||
                '"reportingActor": "UNIT",' ||
                '"controlUnitId": 10012,' ||
                '"authorTrigram": "",' ||
                '"authorContact": "Jean Bon (0600000000)",' ||
                '"title": "Pêche sans VMS ni JPE",' ||
                '"description": "Pêche thon rouge sans VMS détecté ni JPE",' ||
                '"natinfCode": 27689,' ||
                '"dml": "DML 29",' ||
                '"type": "INFRACTION_SUSPICION",' ||
                '"seaFront": "NAMO"' ||
                '}')::jsonb, null, null, 11),
       ('OBSERVATION', 'RENCONTRER VEILLER APPARTEMENT"', 'ABC000597493', 'JL026591', 'CMQ7994',
        'INTERNAL_REFERENCE_NUMBER', 'FR', NOW() - ('1 DAY 1 HOUR')::interval, NOW() - ('1 DAY  1 HOUR')::interval, false,
        false, ('{' ||
                '"reportingActor": "UNIT",' ||
                '"controlUnitId": 10012,' ||
                '"authorTrigram": "",' ||
                '"authorContact": "Jean Bon (0600000000)",' ||
                '"title": "OBSERVATION: Pêche sans VMS ni JPE",' ||
                '"description": "OBSERVATION: Pêche thon rouge sans VMS détecté ni JPE",' ||
                '"type": "OBSERVATION",' ||
                '"seaFront": "NAMO"' ||
                '}')::jsonb, null, null, 11);

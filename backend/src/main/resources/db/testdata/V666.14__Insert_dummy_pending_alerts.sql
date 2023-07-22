TRUNCATE TABLE pending_alerts RESTART IDENTITY CASCADE;

INSERT INTO pending_alerts (vessel_name, internal_reference_number, external_reference_number, ircs, flag_state, creation_date,
                            trip_number, vessel_identifier, value, latitude, longitude)
VALUES ('PHENOMENE', 'FAK000999999', 'DONTSINK', 'CALLME','FR',  NOW(), '9463715', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
                                                                                                           '"seaFront": "NAMO",' ||
                                                                                                           '"riskFactor": 3.5647,' ||
                                                                                                           '"dml": "DML 13",' ||
                                                                                                           '"type": "THREE_MILES_TRAWLING_ALERT"' ||
                                                                                                           '}')::jsonb, -40.4050, -9.6987),
       ('MALOTRU', 'U_W0NTFINDME', 'TALK2ME', 'QGDF','FR',  NOW(), '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
                                                                                                      '"seaFront": "NAMO",' ||
                                                                                                      '"riskFactor": 1.5647,' ||
                                                                                                      '"dml": "DML 06",' ||
                                                                                                      '"type": "THREE_MILES_TRAWLING_ALERT"' ||
                                                                                                      '}')::jsonb, -28.7514, 126.258),
       ('PAYSAGE ROMAN LIER', 'ABC000339263', 'CN775734', 'YHIZ',
        'FR', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '15 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "SA",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, null, null),
       ('LE b@TO', 'FR263418260', '08FR65324', 'IR12A',
        'FR', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '13 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "NAMO",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, -55.5963, -11.2245),
       ('PHENOMENE', 'ABC000259234', 'XS666810', 'VU2483',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '12 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "NAMO",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, null, null),
       ('PHENOMENE', 'ABC000777801', 'DA215454', 'RZUW',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '10 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "MED",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, -75.698, 51.5987),
       ('PHENOMENE', 'ABC000180818', 'GJ232455', 'VSJM',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '9 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "MED",' ||
         '"flagState": "FR",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, null, null),
       ('PHENOMENE', 'ABC000011166', 'WN121110', 'KK5645',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '8 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "MED",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, -8.96, 51.8514),
       ('PHENOMENE', 'ABC000543897', 'NW232931', 'MPBS',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '7 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "NAMO",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, null, null),
       ('PHENOMENE', 'ABC000073956', 'GD896743', 'KAML',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '6 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "NAMO",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, -5.1258, 47.6789),
       ('PHENOMENE', 'ABC000960650', 'BI807222', 'LC0403',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '5 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "SA",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, -8.56, -22.0236),
       ('PHENOMENE', 'ABC000349363', 'KX186589', 'OA0800',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '4 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "SA",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, null, null),
       ('PHENOMENE', 'ABC000089374', 'LP645300', 'RXQO',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '3 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "Guyane",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, -4.5691, 19.6547),
       ('PHENOMENE', 'ABC000221063', 'OI435694', 'JHKB',
        'GB', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '2 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "Guadeloupe",' ||
         '"riskFactor": 2.5647,' ||
         '"dml": "DML 56",' ||
         '"type": "THREE_MILES_TRAWLING_ALERT"' ||
         '}')::jsonb, null, null),
       ('TEMPÊTE COULEUR PUIS', 'ABC000118343', 'TO598604', 'MRCP',
        'FR', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '1 hours 7 minutes', '2020005', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "NAMO",' ||
         '"riskFactor": 2.5,' ||
         '"dml": "DML 56",' ||
         '"type": "FRENCH_EEZ_FISHING_ALERT"' ||
         '}')::jsonb, 73.569, -52.456),
       ('ASSURER TON COMME', 'ABC000207106', 'DC896841', 'MNMN',
        'FR', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '2 hours 7 minutes', '2020009', 'INTERNAL_REFERENCE_NUMBER',
        ('{' ||
         '"seaFront": "NAMO",' ||
         '"riskFactor": 2.2,' ||
         '"dml": "DML 56", '||
         '"type": "TWELVE_MILES_FISHING_ALERT"' ||
         '}')::jsonb, 5.56, 1.2),
       ('MARQUER NOTE MANIER', 'ABC000498845', 'YH219470', 'EXG7039',
        'FR', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '4 hours 7 minutes', null, 'INTERNAL_REFERENCE_NUMBER', ('{' ||
                                                                                                                  '"seaFront": "NAMO",' ||
                                                                                                                  '"riskFactor": 3.4,' ||
                                                                                                                  '"type": "MISSING_FAR_ALERT"' ||
                                                                                                                  '}')::jsonb, -12.569, 8.851),
       ('MAINTENANT RÉPONSE ANNÉE', 'ABC000823773', 'HG384751', 'NK2932',
        'FR', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - interval '2 hours 17 minutes', null, 'INTERNAL_REFERENCE_NUMBER', ('{' ||
                                                                                                                  '"seaFront": "NAMO",' ||
                                                                                                                  '"riskFactor": 1.5,' ||
                                                                                                                  '"type": "MISSING_FAR_48_HOURS_ALERT"' ||
                                                                                                                  '}')::jsonb, -10.569, 48.851);

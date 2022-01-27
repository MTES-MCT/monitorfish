INSERT INTO pending_alerts (vessel_name,internal_reference_number,external_reference_number,ircs,creation_date,trip_number,vessel_identifier,value) VALUES
('PHENOMENE', 'FAK000999999', 'DONTSINK', 'CALLME', NOW(), '9463715', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 3.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'U_W0NTFINDME', 'ABC123456', 'TALK2ME', NOW(), '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 1.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000363962', 'QZ642965', 'SK1266', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '15 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000035772', 'ZR522262', 'NC1001', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '13 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000259234', 'XS666810', 'VU2483', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '12 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000777801', 'DA215454', 'RZUW', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '10 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "MED",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000180818', 'GJ232455', 'VSJM', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '9 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "MED",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000011166', 'WN121110', 'KK5645', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '8 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "MED",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000543897', 'NW232931', 'MPBS', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '7 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000073956', 'GD896743', 'KAML', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '6 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000960650', 'BI807222', 'LC0403', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '5 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "SA",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000349363', 'KX186589', 'OA0800', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '4 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "SA",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000089374', 'LP645300', 'RXQO', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '3 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "Guyane",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('PHENOMENE', 'ABC000221063', 'OI435694', 'JHKB', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '2 hours 45 minutes', '9463723', 'INTERNAL_REFERENCE_NUMBER', ('{' ||
    '"seaFront": "Guadeloupe",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb);

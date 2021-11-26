INSERT INTO alerts (alert_id,name,vessel_name,internal_reference_number,external_reference_number,ircs,creation_date,trip_number,value) VALUES
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'FAK000999999', 'DONTSINK', 'CALLME', NOW(), '9463715', ('{' ||
    '"speed":2.3,' ||
    '"numberOfIncursion": 4,' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'U_W0NTFINDME', 'ABC123456', 'TALK2ME', NOW(), '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000363962', 'QZ642965', 'SK1266', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '15 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000035772', 'ZR522262', 'NC1001', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '13 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000259234', 'XS666810', 'VU2483', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '12 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000777801', 'DA215454', 'RZUW', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '10 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "MED",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000180818', 'GJ232455', 'VSJM', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '9 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "MED",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000011166', 'WN121110', 'KK5645', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '8 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "MED",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000543897', 'NW232931', 'MPBS', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '7 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000073956', 'GD896743', 'KAML', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '6 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000960650', 'BI807222', 'LC0403', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '5 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "SA",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000349363', 'KX186589', 'OA0800', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '4 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "SA",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000089374', 'LP645300', 'RXQO', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '3 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "Guyane",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
(uuid_generate_v4(), 'THREE_MILES_TRAWLING_ALERT', 'PHENOMENE', 'ABC000221063', 'OI435694', 'JHKB', (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '2 hours 45 minutes', '9463723', ('{' ||
    '"speed":1.6,' ||
    '"numberOfIncursion": 2,' ||
    '"seaFront": "Guadeloupe",' ||
    '"flagState": "FR",' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb);

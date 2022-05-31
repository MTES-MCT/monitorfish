INSERT INTO reporting (type, vessel_name, internal_reference_number, external_reference_number, ircs, vessel_identifier, creation_date, validation_date, archived, deleted, value) VALUES
('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 3.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('56 DAY')::interval, NOW() - ('26 DAY')::interval, true, false, ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 3.3647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT"' ||
    '}')::jsonb),
('ALERT', 'PROMETTRE INTÉRIEUR SAINT', 'ABC000232227', 'ZJ472279', 'TMG5756', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
   '"seaFront": "SA",' ||
   '"flagState": "FR",' ||
   '"riskFactor": 2.647,' ||
   '"type": "TWELVE_MILES_FISHING_ALERT"' ||
   '}')::jsonb),
('ALERT', 'HAÏR GAUCHE VIVRE', 'ABC000591595', 'HK498094', 'KF0313', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('2 DAY')::interval, NOW() - ('1 DAY')::interval, false, false, ('{' ||
   '"seaFront": "MEMN",' ||
   '"flagState": "FR",' ||
   '"riskFactor": 1.389,' ||
   '"type": "MISSING_FAR_ALERT"' ||
   '}')::jsonb)
;

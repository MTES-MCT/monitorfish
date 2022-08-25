INSERT INTO reportings (type, vessel_name, internal_reference_number, external_reference_number, ircs, vessel_identifier, creation_date, validation_date, archived, deleted, value) VALUES
('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 3.5647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT",' ||
    '"natinfCode": "7059"' ||
    '}')::jsonb),
('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('56 DAY')::interval, NOW() - ('26 DAY')::interval, true, false, ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 3.3647,' ||
    '"type": "THREE_MILES_TRAWLING_ALERT",' ||
    '"natinfCode": "7059"' ||
    '}')::jsonb),
('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('120 DAY')::interval, NOW() - ('29 DAY')::interval, true, true, ('{' ||
    '"seaFront": "NAMO",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 3.6947,' ||
    '"type": "MISSING_FAR_ALERT",' ||
    '"natinfCode": "27689"' ||
    '}')::jsonb),
('ALERT', 'PROMETTRE INTÉRIEUR SAINT', 'ABC000232227', 'ZJ472279', 'TMG5756', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
    '"seaFront": "SA",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 2.647,' ||
    '"type": "TWELVE_MILES_FISHING_ALERT",' ||
    '"natinfCode": "2610"' ||
    '}')::jsonb),
('ALERT', 'HAÏR GAUCHE VIVRE', 'ABC000591595', 'HK498094', 'KF0313', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('2 DAY')::interval, NOW() - ('1 DAY')::interval, false, false, ('{' ||
    '"seaFront": "MEMN",' ||
    '"flagState": "FR",' ||
    '"riskFactor": 1.389,' ||
    '"type": "MISSING_FAR_ALERT",' ||
    '"natinfCode": "27689"' ||
    '}')::jsonb),
('INFRACTION_SUSPICION', 'COURANT MAIN PROFESSEUR', 'ABC000042310', 'IW783219', 'QD0506', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW() - ('1 DAY')::interval, false, false, ('{' ||
    '"reportingActor": "OPS",' ||
    '"unit": "",' ||
    '"authorTrigram": "LTH",' ||
    '"authorContact": "",' ||
    '"title": "Suspicion de chalutage dans les 3 milles",' ||
    '"description": "Chalutage dans les 3 milles (vitesse & parcours pêche) le 22/08/22 à 22h56",' ||
    '"natinfCode": "23588",' ||
    '"flagState": "FR",' ||
    '"dml": "DML 29",' ||
    '"type": "INFRACTION_SUSPICION",' ||
    '"seaFront": "NAMO"' ||
    '}')::jsonb),
('INFRACTION_SUSPICION', 'RENCONTRER VEILLER APPARTEMENT"', 'ABC000597493', 'JL026591', 'CMQ7994', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW() - ('1 DAY')::interval, false, false, ('{' ||
    '"reportingActor": "UNIT",' ||
    '"unit": "ULAM 56",' ||
    '"authorTrigram": "",' ||
    '"authorContact": "Jean Bon (0600000000)",' ||
    '"title": "Pêche sans VMS ni JPE",' ||
    '"description": "Pêche thon rouge sans VMS détecté ni JPE",' ||
    '"natinfCode": "27689",' ||
    '"flagState": "FR",' ||
    '"dml": "DML 29",' ||
    '"type": "INFRACTION_SUSPICION",' ||
    '"seaFront": "NAMO"' ||
    '}')::jsonb)
;

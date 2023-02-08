INSERT INTO controllers (id, controller, controller_type, administration)
VALUES (151, 'ULAM 56', 'Terrestre', 'Affaires Maritimes'),
       (12, 'Unité XYZ', 'Aérien', 'Marine Nationale');

INSERT INTO reportings (type, vessel_name, internal_reference_number, external_reference_number, ircs,
                        vessel_identifier, creation_date, validation_date, archived, deleted, value, latitude, longitude, vessel_id)
VALUES ('INFRACTION_SUSPICION', 'COURANT MAIN PROFESSEUR', 'ABC000042310', 'IW783219', 'QD0506',
        'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW() - ('1 DAY')::interval, false,
        false, ('{' ||
              '"reportingActor": "OPS",' ||
              '"unit": null,' ||
              '"authorTrigram": "LTH",' ||
              '"authorContact": "",' ||
              '"title": "Suspicion de chalutage dans les 3 milles",' ||
              '"description": "Chalutage dans les 3 milles (vitesse & parcours pêche) le 22/08/22 à 22h56",' ||
              '"natinfCode": "23588",' ||
              '"flagState": "FR",' ||
              '"dml": "DML 29",' ||
              '"type": "INFRACTION_SUSPICION",' ||
              '"seaFront": "NAMO"' ||
              '}')::jsonb, null, null, 10),
       ('INFRACTION_SUSPICION', 'RENCONTRER VEILLER APPARTEMENT"', 'ABC000597493', 'JL026591', 'CMQ7994',
        'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY 1 HOUR')::interval, NOW() - ('1 DAY 1 HOUR')::interval, false,
        false, ('{' ||
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
                '}')::jsonb, null, null, 11),
       ('OBSERVATION', 'RENCONTRER VEILLER APPARTEMENT"', 'ABC000597493', 'JL026591', 'CMQ7994',
        'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY 1 HOUR')::interval, NOW() - ('1 DAY  1 HOUR')::interval, false,
        false, ('{' ||
                '"reportingActor": "UNIT",' ||
                '"unit": "ULAM 56",' ||
                '"authorTrigram": "",' ||
                '"authorContact": "Jean Bon (0600000000)",' ||
                '"title": "OBSERVATION: Pêche sans VMS ni JPE",' ||
                '"description": "OBSERVATION: Pêche thon rouge sans VMS détecté ni JPE",' ||
                '"flagState": "FR",' ||
                '"type": "OBSERVATION",' ||
                '"seaFront": "NAMO"' ||
                '}')::jsonb, null, null, 11);

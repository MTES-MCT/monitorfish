TRUNCATE TABLE silenced_alerts RESTART IDENTITY CASCADE;
INSERT INTO silenced_alerts (vessel_name, internal_reference_number, external_reference_number, ircs, vessel_identifier,
                             flag_state, silenced_before_date, value)
VALUES ('NATUREL NON FUIR', 'ABC000571489', 'IS726385', 'LRED', 'INTERNAL_REFERENCE_NUMBER',
        'FR', NOW() + ('15 DAYS')::interval, ('{' ||
                                                                     '"seaFront": "MEMN",' ||
                                                                     '"riskFactor": 3.6947,' ||
                                                                     '"type": "POSITION_ALERT",' ||
                                                                     '"alert_id": 8,' ||
                                                                     '"name": "Pêche dans les 12 milles sans droits historiques",' ||
                                                                     '"natinfCode": 27689' ||
                                                                     '}')::jsonb),
       ('JARDIN TANT DESCENDRE', 'ABC000417080', 'KS181242', 'QFH9332', 'INTERNAL_REFERENCE_NUMBER',
        'FR', NOW() + ('50 DAYS')::interval, ('{' ||
                                              '"seaFront": "NAMO",' ||
                                              '"riskFactor": 3.6947,' ||
                                              '"type": "MISSING_FAR_ALERT",' ||
                                              '"natinfCode": 27689' ||
                                              '}')::jsonb),
       ('FRAPPER PREFERER RIRE', 'ABC000900977', 'QG773364', 'CA2048', 'INTERNAL_REFERENCE_NUMBER',
        'FR', NOW() + ('5 HOURS')::interval, ('{' ||
                                              '"seaFront": "SA",' ||
                                              '"riskFactor": 3.6947,' ||
                                              '"type": "POSITION_ALERT",' ||
                                              '"alert_id": 1,' ||
                                              '"name": "Chalutage dans les 3 milles",'
                                              '"natinfCode": 27689' ||
                                              '}')::jsonb),
       ('FORTUNE ARME ABATTRE', 'ABC000677933', 'IG415546', 'UTIG', 'INTERNAL_REFERENCE_NUMBER',
        'X', NOW() + ('24 HOURS')::interval, ('{' ||
                                               '"seaFront": "NAMO",' ||
                                               '"riskFactor": 3.6947,' ||
                                               '"type": "POSITION_ALERT",' ||
                                               '"alert_id": 1,' ||
                                               '"name": "Chalutage dans les 3 milles",'
                                               '"natinfCode": 27689' ||
                                               '}')::jsonb);

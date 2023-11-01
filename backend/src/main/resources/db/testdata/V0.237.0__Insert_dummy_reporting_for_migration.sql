-- This test data is inserted before the V0.237.1__Update_reportings_table.sql migration
-- in order to test fixing the `controlUnitId` empty string

INSERT INTO reportings (type, vessel_name, internal_reference_number, external_reference_number, ircs,
                        vessel_identifier, flag_state, creation_date, validation_date, archived, deleted, value, latitude, longitude, vessel_id)
VALUES ('ALERT', 'TEMPORARY VESSEL NAME', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', 'FR',
        NOW(), NOW(), false, false, ('{' ||
                                                           '"seaFront": "NAMO",' ||
                                                           '"riskFactor": 3.5647,' ||
                                                           '"type": "THREE_MILES_TRAWLING_ALERT",' ||
                                                           '"natinfCode": "7059",' ||
                                                           '"controlUnitId": ""' ||
                                                           '}')::jsonb, 41.569, 37.28, null)

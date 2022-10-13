DELETE FROM reportings;

INSERT INTO reportings (type, vessel_name, internal_reference_number, external_reference_number, ircs, vessel_identifier, creation_date, validation_date, archived, deleted, value) VALUES
('ALERT', 'MARIAGE ÎLE HASARD', 'ABC000180832', 'VP374069', 'CG1312', 'INTERNAL_REFERENCE_NUMBER', NOW() - ('1 DAY')::interval, NOW(), false, false, ('{' ||
  '"seaFront": "NAMO",' ||
  '"flagState": "FR",' ||
  '"riskFactor": 3.5647,' ||
  '"type": "THREE_MILES_TRAWLING_ALERT",' ||
  '"natinfCode": "7059"' ||
  '}')::jsonb);
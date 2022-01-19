DELETE FROM pending_alerts;

INSERT INTO pending_alerts (
    vessel_name, internal_reference_number, external_reference_number, ircs, 
    creation_date, trip_number, 
    value
) VALUES 
(
    'L''AMBRE', 'FRA000614250', 'GV614250', 'FUJW', 
    '2021-12-23 16:03:00+00', NULL, 
    '{"type": "THREE_MILES_TRAWLING_ALERT", "seaFront": "NAMO", "flagState": "FR"}'
);
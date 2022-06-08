DELETE FROM silenced_alerts;

INSERT INTO silenced_alerts (
    vessel_name, internal_reference_number, external_reference_number, ircs, vessel_identifier,
    silenced_before_date, silenced_after_date, value
) VALUES 
(
    'MYNAMEIS', 'ABC000658985', 'OHMYGOSH', 'OGMJ', 'INTERNAL_REFERENCE_NUMBER',
    NOW() + ('15 DAYS')::interval, NULL,
    '{"type": "THREE_MILES_TRAWLING_ALERT", "seaFront": "Facade B", "flagState": "FR"}'
);

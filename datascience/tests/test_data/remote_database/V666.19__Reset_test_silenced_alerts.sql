DELETE FROM silenced_alerts;

INSERT INTO silenced_alerts (
    vessel_name, internal_reference_number, external_reference_number, ircs, vessel_identifier,
    silenced_before_date, flag_state, value
) VALUES
(
    'MYNAMEIS', 'ABC000658985', 'OHMYGOSH', 'OGMJ', 'INTERNAL_REFERENCE_NUMBER',
    NOW() + ('15 DAYS')::interval, 'FR',
    '{"type": "THREE_MILES_TRAWLING_ALERT", "seaFront": "SA"}'
),
(
    'DEVINER FIGURE CONSCIENCE', 'ABC000542519', 'RO237719', 'FQ7058', 'INTERNAL_REFERENCE_NUMBER',
    NOW() + ('15 DAYS')::interval, 'FR',
    '{"type": "MISSING_FAR_ALERT", "seaFront": "NAMO"}'
);

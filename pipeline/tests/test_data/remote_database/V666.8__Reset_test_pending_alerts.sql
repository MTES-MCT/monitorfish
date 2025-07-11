DELETE FROM pending_alerts;

INSERT INTO pending_alerts (
    id,
    vessel_name, internal_reference_number, external_reference_number, ircs, vessel_identifier,
    creation_date, trip_number, flag_state,
    value,
    alert_config_name
) VALUES
(
    12,
    'L''AMBRE', 'FRA000614250', 'GV614250', 'FUJW', 'INTERNAL_REFERENCE_NUMBER',
    '2021-12-23 16:03:00+00', NULL, 'FR',
    '{"type": "THREE_MILES_TRAWLING_ALERT", "seaFront": "NAMO"}',
    'ALERTE_1'
);

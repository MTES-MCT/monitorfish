DELETE FROM reportings;

INSERT INTO reportings (
    id,    type, vessel_id, internal_reference_number, external_reference_number,       ircs,      vessel_name, vessel_identifier,               creation_date, validation_date, archived, deleted, flag_state,                                                                                                                              value) VALUES
(    56, 'ALERT',         6,                      NULL,               'ZZTOPACDC', 'ZZ000000', 'I DO 4H REPORT',            'IRCS', NOW() - ('1 DAY')::interval,           NOW(),    false,   false, 'FR'      ,'{"seaFront": "NAMO", "riskFactor": 3.5647, "type": "THREE_MILES_TRAWLING_ALERT", "natinfCode": 7059}'::jsonb);

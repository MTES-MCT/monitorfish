-- Logbook of AIGLE CALME, replayed 5 days ago by the `position_replay.spec.ts` Cypress spec.
-- The replayed date is the middle of its positions inserted by V666.46, so that both stay aligned
-- even when this migration runs later than V666.46.
--
-- - Trip 20261101 is the trip at the replayed date: it starts 10 hours before it,
--   and its last FAR is sent 11 hours after it (the Cypress spec replays a few hours after the migrations).
-- - Trip 20261102 is the current trip: it must not be displayed instead when replaying a date without trip.

INSERT INTO trips_snapshot (cfr, trip_number, start_datetime_utc, end_datetime_utc, first_operation_datetime_utc, last_operation_datetime_utc)
SELECT 'ABC010511983', '20261101', replayed_at - INTERVAL '10 hours', replayed_at + INTERVAL '11 hours',
       replayed_at - INTERVAL '10 hours', replayed_at + INTERVAL '11 hours'
FROM (SELECT (SELECT MIN(date_time) + INTERVAL '12 hours' FROM positions WHERE internal_reference_number = 'ABC010511983') AS replayed_at) AS t;

INSERT INTO logbook_raw_messages (operation_number, xml_message)
SELECT prefix || id, '<ers:OPS/>'
FROM unnest(ARRAY['0000001', '0000002', '0000003', '0000004', '0000005']) AS id,
     unnest(ARRAY['REPLAY', 'REPLAYRET']) AS prefix;

INSERT INTO logbook_reports (operation_number, trip_number, operation_country, operation_datetime_utc, operation_type,
                             report_id, referenced_report_id, report_datetime_utc, cfr, ircs, external_identification,
                             vessel_name, flag_state, imo, log_type, value, integration_datetime_utc,
                             activity_datetime_utc, transmission_format, software)
SELECT 'REPLAY' || message.id, message.trip_number, 'OOF', message.date_time, 'DAT',
       'REPLAY' || message.id, null, message.date_time, 'ABC010511983', 'IRCS132', 'EXTIMM132',
       'AIGLE CALME', 'FRA', null, message.log_type, message.value, message.date_time,
       message.date_time, 'ERS', 'TurboCatch (3.7-1)'
FROM (
    SELECT
        id,
        trip_number,
        log_type,
        date_time,
        CASE log_type
            WHEN 'DEP' THEN jsonb_build_object(
                'gearOnboard', jsonb_build_array(jsonb_build_object('gear', 'OTB', 'mesh', 80.0)),
                'departurePort', 'FRLRT',
                'anticipatedActivity', 'FSH',
                'departureDatetimeUtc', to_char(date_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
            )
            ELSE jsonb_build_object(
                'hauls', jsonb_build_array(jsonb_build_object(
                    'gear', 'OTB',
                    'mesh', 80.0,
                    'farDatetimeUtc', to_char(date_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
                    'catches', jsonb_build_array(jsonb_build_object(
                        'species', species,
                        'weight', weight,
                        'nbFish', null,
                        'faoZone', '27.8.a',
                        'effortZone', null,
                        'economicZone', 'FRA',
                        'statisticalRectangle', '23E6'
                    ))
                ))
            )
        END AS value
    FROM (
        SELECT (SELECT MIN(date_time) + INTERVAL '12 hours' FROM positions WHERE internal_reference_number = 'ABC010511983') AS replayed_at,
               (now() AT TIME ZONE 'UTC')::TIMESTAMP AS now_utc
    ) AS t,
    LATERAL (VALUES
        ('0000001', '20261101', 'DEP', replayed_at - INTERVAL '10 hours', null, null),
        ('0000002', '20261101', 'FAR', replayed_at - INTERVAL '3 hours', 'SOL', 120.0),
        ('0000003', '20261101', 'FAR', replayed_at + INTERVAL '11 hours', 'HKE', 300.0),
        ('0000004', '20261102', 'DEP', now_utc - INTERVAL '20 hours', null, null),
        ('0000005', '20261102', 'FAR', now_utc - INTERVAL '10 hours', 'BSS', 45.0)
    ) AS messages(id, trip_number, log_type, date_time, species, weight)
) AS message;

-- French vessels' messages are only displayed once acknowledged
INSERT INTO logbook_reports (operation_number, trip_number, operation_country, operation_datetime_utc, operation_type,
                             report_id, referenced_report_id, report_datetime_utc, cfr, ircs, external_identification,
                             vessel_name, flag_state, imo, log_type, activity_datetime_utc, value, integration_datetime_utc,
                             transmission_format)
SELECT 'REPLAYRET' || SUBSTRING(operation_number FROM 7), null, 'OOF', operation_datetime_utc, 'RET',
       null, report_id, operation_datetime_utc, null, null, null,
       null, null, null, '', null, '{"returnStatus": "000"}', operation_datetime_utc,
       'ERS'
FROM logbook_reports
WHERE operation_number LIKE 'REPLAY0%';

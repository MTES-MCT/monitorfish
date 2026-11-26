-- Positions around a night 5 days ago, replayed by the `position_replay.spec.ts` Cypress spec.
-- The other dummy positions are all within the last 3 days: nothing else is found when replaying 5 days ago.
--
-- Series span 12 hours on both sides of `now() - 5 days`, so that the replayed vessels stay the same
-- whether the test runs right after the migrations or a few hours later.

-- AIGLE CALME: VMS only, every hour
INSERT INTO positions (internal_reference_number, external_reference_number, mmsi, ircs, vessel_name, flag_state, latitude, longitude, speed, course, date_time, position_type)
SELECT 'ABC010511983', 'EXTIMM132', 'MMSI132', 'IRCS132', 'AIGLE CALME', 'FR', 47.5 + h * 0.01, -4.5, 6.2, 5,
       (now() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '5 days' + h * INTERVAL '1 hour', 'VMS'
FROM generate_series(-12, 12) AS h;

-- AIGLE CINQUANTE-NEUF: VMS every hour and AIS every 10 minutes, the more recent AIS position is replayed
INSERT INTO positions (internal_reference_number, external_reference_number, mmsi, ircs, vessel_name, flag_state, latitude, longitude, speed, course, date_time, position_type)
SELECT 'ABC011871989', 'EXTIMM133', 'MMSI133', 'IRCS133', 'AIGLE CINQUANTE-NEUF', 'FR', 47.3 + h * 0.01, -4.8, 8.1, 350,
       (now() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '5 days' + h * INTERVAL '1 hour', 'VMS'
FROM generate_series(-12, 12) AS h;

INSERT INTO ais_positions (mmsi, date_time, latitude, longitude, speed, course, status, ircs, external_immatriculation, vessel_name, cfr)
SELECT 227999133, now() - INTERVAL '5 days' + m * INTERVAL '10 minutes', 47.31 + m * 0.002, -4.81, 8.0, 350,
       'Engaged in fishing', 'IRCS133', 'EXTIMM133', 'AIGLE CINQUANTE-NEUF', 'ABC011871989'
FROM generate_series(-72, 72) AS m;

-- AIGLE CRYPTÉE: only VMS positions older than the 6 hours VMS look-back, never replayed
INSERT INTO positions (internal_reference_number, external_reference_number, mmsi, ircs, vessel_name, flag_state, latitude, longitude, speed, course, date_time, position_type)
SELECT 'ABC012312001', 'EXTIMM134', 'MMSI134', 'IRCS134', 'AIGLE CRYPTÉE', 'FR', 47.1, -5.0, 0, 0,
       (now() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '5 days' - h * INTERVAL '1 hour', 'VMS'
FROM generate_series(7, 9) AS h;

-- LUCIOLE: AIS only, without CFR, every 10 minutes
INSERT INTO ais_positions (mmsi, date_time, latitude, longitude, speed, course, status, ircs, vessel_name, ship_type)
SELECT 227999001, now() - INTERVAL '5 days' + m * INTERVAL '10 minutes', 47.6, -4.2 + m * 0.002, 4.5, 90,
       'Under way using engine', 'FLUC1', 'LUCIOLE', 37
FROM generate_series(-72, 72) AS m;

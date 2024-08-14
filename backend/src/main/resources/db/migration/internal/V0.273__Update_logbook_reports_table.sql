ALTER TABLE public.logbook_reports
  ADD COLUMN activity_datetime_utc TIMESTAMP WITHOUT TIME ZONE;

-- Requête à exécuter après MEP pour ne pas créer de downtime pendant la MEP

-- UPDATE logbook_reports
-- SET activity_datetime_utc = CASE
--         WHEN log_type = 'DEP' THEN (value->>'departureDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'NOT-COE' THEN (value->>'effortZoneEntryDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'COE' THEN (value->>'effortZoneEntryDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'FAR' THEN (SELECT MIN((haul->>'farDatetimeUtc')::TIMESTAMPTZ) AT TIME ZONE 'UTC' FROM jsonb_array_elements(value->'hauls') haul)
--         WHEN log_type = 'CPS' THEN (value->>'cpsDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'DIS' THEN (value->>'discardDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'NOT-COX' THEN (value->>'effortZoneExitDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'COX' THEN (value->>'effortZoneExitDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'CRO' THEN (value->>'effortZoneExitDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'EOF' THEN (value->>'endOfFishingDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'PNO' THEN (value->>'predictedArrivalDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'LAN' THEN (value->>'landingDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         WHEN log_type = 'RTP' THEN (value->>'returnDatetimeUtc')::TIMESTAMPTZ AT TIME ZONE 'UTC'
--         ELSE NULL
--     END
-- WHERE log_type IS NOT NULL
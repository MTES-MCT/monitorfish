CREATE INDEX IF NOT EXISTS manual_prior_notifications_vessel_id_idx ON manual_prior_notifications (vessel_id);

CREATE FUNCTION iso_zulu_text_to_date(text) RETURNS TIMESTAMP WITHOUT TIME ZONE
   IMMUTABLE LANGUAGE sql AS
$$
    SELECT CAST($1 AS TIMESTAMPTZ) AT TIME ZONE 'UTC'
$$;

CREATE INDEX IF NOT EXISTS manual_prior_notifications_predicted_arrival_datetime_utc_idx
ON manual_prior_notifications (
    (iso_zulu_text_to_date(value ->> 'predictedArrivalDatetimeUtc'))
);

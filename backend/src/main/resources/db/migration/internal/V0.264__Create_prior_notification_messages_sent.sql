CREATE TABLE public.prior_notification_sent_messages (
    id serial PRIMARY KEY,
    prior_notification_report_id VARCHAR NOT NULL,
    prior_notification_source prior_notification_source NOT NULL,
    date_time_utc TIMESTAMP NOT NULL,
    communication_means communication_means NOT NULL,
    recipient_address_or_number VARCHAR NOT NULL,
    success BOOLEAN NOT NULL,
    error_message VARCHAR
);

CREATE INDEX prior_notification_sent_messages_prior_notification_report_id_idx
ON public.prior_notification_sent_messages (prior_notification_report_id);

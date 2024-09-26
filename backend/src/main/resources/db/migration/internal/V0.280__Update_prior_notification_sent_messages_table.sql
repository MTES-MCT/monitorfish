DELETE FROM public.prior_notification_sent_messages;

ALTER TABLE public.prior_notification_sent_messages
    ADD COLUMN recipient_name VARCHAR NOT NULL,
    ADD COLUMN recipient_organization VARCHAR NOT NULL;
DELETE FROM public.prior_notification_sent_messages;

ALTER TABLE public.prior_notification_sent_messages
    ADD COLUMN control_unit VARCHAR NOT NULL,
    ADD COLUMN administration VARCHAR NOT NULL;
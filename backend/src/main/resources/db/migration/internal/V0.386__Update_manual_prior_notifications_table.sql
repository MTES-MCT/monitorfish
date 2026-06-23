ALTER TABLE manual_prior_notifications
    ADD COLUMN trip_number VARCHAR(100);

CREATE INDEX ON public.manual_prior_notifications (trip_number);

CREATE TYPE public.prior_notification_source AS ENUM ('MANUAL', 'LOGBOOK');

CREATE TABLE public.prior_notification_pdf_documents (
    report_id VARCHAR PRIMARY KEY,
    source prior_notification_source NOT NULL,
    generation_datetime_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    pdf_document BYTEA
);

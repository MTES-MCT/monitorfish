ALTER TABLE public.user_authorizations
    ADD COLUMN idp_id VARCHAR,
    ADD COLUMN sub VARCHAR;

CREATE TABLE public.authorization_audit_logs (
    id SERIAL PRIMARY KEY,
    actor_email VARCHAR,
    action VARCHAR NOT NULL,
    target VARCHAR NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX authorization_audit_logs_created_at_utc_idx ON public.authorization_audit_logs (created_at_utc DESC);

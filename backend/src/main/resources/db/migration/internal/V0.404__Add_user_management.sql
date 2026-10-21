CREATE TYPE public.external_administration AS ENUM ('DOUANE', 'GENDARMERIE_MARITIME', 'GENDARMERIE_NATIONALE');

ALTER TABLE public.user_authorizations
    ADD COLUMN email VARCHAR,
    ADD COLUMN administration public.external_administration,
    ADD COLUMN last_login_at_utc TIMESTAMP WITH TIME ZONE;

CREATE INDEX user_authorizations_administration_idx ON public.user_authorizations (administration);

CREATE TABLE public.authorized_organizational_units (
    organizational_unit VARCHAR PRIMARY KEY,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

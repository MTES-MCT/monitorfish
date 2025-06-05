CREATE TYPE public.cnsp_service AS ENUM ('Pôle OPS métropole', 'Pôle SIP', 'Pôle reg./planif.', 'Pôle OPS outre-mer');

ALTER TABLE public.user_authorizations
    ADD COLUMN service cnsp_service,
    ADD COLUMN is_administrator BOOLEAN NOT NULL DEFAULT FALSE;

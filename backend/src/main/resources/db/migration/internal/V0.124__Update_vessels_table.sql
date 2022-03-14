CREATE TYPE public.beacon_status AS ENUM ('ACTIVATED', 'DEACTIVATED', 'IN_TEST', 'NON_APPROVED', 'UNSUPERVISED');

ALTER TABLE public.vessels
    ADD COLUMN beacon_status beacon_status;
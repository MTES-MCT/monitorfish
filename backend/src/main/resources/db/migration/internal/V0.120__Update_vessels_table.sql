CREATE TYPE public.beacon_status AS ENUM ('Activée', 'Désactivée', 'En test', 'Non agréée', 'Non surveillée');

ALTER TABLE public.vessels
    ADD COLUMN beacon_status beacon_status;
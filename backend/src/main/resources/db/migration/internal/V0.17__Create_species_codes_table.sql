CREATE TABLE if not exists public.species
(
    id                 integer                NOT NULL,
    species_code       character varying(100) NOT NULL,
    species_name       character varying(200),
    species_group_code character varying(200),
    species_group_name character varying(200),
    source             character varying(200)
);

ALTER TABLE public.species
    DROP CONSTRAINT IF EXISTS species_pkey;
ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (species_code);
CREATE INDEX ON public.species (species_code);

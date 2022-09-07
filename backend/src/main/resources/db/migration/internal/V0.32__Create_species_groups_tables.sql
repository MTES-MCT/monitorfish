-- Table of species groups
CREATE TABLE public.species_groups (
    id SERIAL PRIMARY KEY,
    species_group VARCHAR NOT NULL,
    comment TEXT
);

-- Many-to-many relation between species and species_groups tables
CREATE TABLE public.species_codes_groups (
    species_code VARCHAR NOT NULL,
    species_group_id INTEGER REFERENCES public.species_groups ON DELETE CASCADE
);

CREATE INDEX ON public.species_codes_groups (species_code);

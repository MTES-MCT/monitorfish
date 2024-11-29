UPDATE public.fleet_segments
SET target_species = ARRAY(SELECT DISTINCT unnest(bycatch_species || target_species));

CREATE TYPE public.species_type AS ENUM ('PELAGIC', 'DEMERSAL');

ALTER TABLE public.fleet_segments
    DROP COLUMN bycatch_species,
    DROP COLUMN dirm,
    DROP COLUMN flag_states,
    ADD COLUMN min_share_of_target_species DOUBLE PRECISION,
    ADD COLUMN favored_main_species_type species_type,
    ADD COLUMN min_mesh DOUBLE PRECISION,
    ADD COLUMN max_mesh DOUBLE PRECISION,
    ADD COLUMN priority DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN vessel_types VARCHAR[];

UPDATE public.fleet_segments
SET min_share_of_target_species = 0
WHERE target_species != '{}';


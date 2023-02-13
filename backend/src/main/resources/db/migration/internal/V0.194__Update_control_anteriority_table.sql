ALTER TABLE public.control_anteriority
    DROP COLUMN number_diversions_last_5_years,
    DROP COLUMN number_seizures_last_5_years,
    DROP COLUMN number_escorts_to_quay_last_5_years,
    ADD COLUMN number_gear_seizures_last_5_years SMALLINT,
    ADD COLUMN number_species_seizures_last_5_years SMALLINT,
    ADD COLUMN number_vessel_seizures_last_5_years SMALLINT;

UPDATE public.control_anteriority
SET
    number_gear_seizures_last_5_years = 0,
    number_species_seizures_last_5_years = 0,
    number_vessel_seizures_last_5_years = 0;

ALTER TABLE public.control_anteriority ALTER COLUMN number_gear_seizures_last_5_years SET NOT NULL;
ALTER TABLE public.control_anteriority ALTER COLUMN number_species_seizures_last_5_years SET NOT NULL;
ALTER TABLE public.control_anteriority ALTER COLUMN number_vessel_seizures_last_5_years SET NOT NULL;

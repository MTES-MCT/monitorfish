DELETE FROM risk_factors;

ALTER TABLE public.risk_factors
    DROP COLUMN number_diversions_last_5_years,
    DROP COLUMN number_seizures_last_5_years,
    DROP COLUMN number_escorts_to_quay_last_5_years,
    ADD COLUMN number_gear_seizures_last_5_years SMALLINT NOT NULL,
    ADD COLUMN number_species_seizures_last_5_years SMALLINT NOT NULL,
    ADD COLUMN number_vessel_seizures_last_5_years SMALLINT NOT NULL;


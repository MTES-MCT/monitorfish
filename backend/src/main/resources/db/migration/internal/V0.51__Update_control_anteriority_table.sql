ALTER TABLE public.control_anteriority
    ADD COLUMN number_controls_last_5_years        SMALLINT,
    ADD COLUMN number_controls_last_3_years        SMALLINT,
    ADD COLUMN number_infractions_last_5_years     SMALLINT,
    ADD COLUMN number_diversions_last_5_years      SMALLINT,
    ADD COLUMN number_seizures_last_5_years        SMALLINT,
    ADD COLUMN number_escorts_to_quay_last_5_years SMALLINT;

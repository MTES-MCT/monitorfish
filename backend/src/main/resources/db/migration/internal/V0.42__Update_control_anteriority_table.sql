ALTER TABLE public.control_anteriority
    ADD COLUMN number_controls_last_5_years SMALLINT NOT NULL,
    ADD COLUMN infraction_rate REAL NOT NULL,
    ADD COLUMN diversion_rate REAL NOT NULL,
    ADD COLUMN seizure_rate REAL NOT NULL,
    ADD COLUMN escort_to_quay_rate REAL NOT NULL;
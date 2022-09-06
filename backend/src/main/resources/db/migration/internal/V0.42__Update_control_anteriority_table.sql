ALTER TABLE public.control_anteriority
    ADD COLUMN number_controls_last_5_years SMALLINT,
    ADD COLUMN infraction_rate              REAL,
    ADD COLUMN diversion_rate               REAL,
    ADD COLUMN seizure_rate                 REAL,
    ADD COLUMN escort_to_quay_rate          REAL;

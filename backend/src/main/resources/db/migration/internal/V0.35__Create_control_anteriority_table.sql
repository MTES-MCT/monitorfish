CREATE TABLE public.control_anteriority (
    vessel_id INTEGER PRIMARY KEY,
    cfr VARCHAR(12),
    ircs VARCHAR(10),
    external_immatriculation VARCHAR(50),
    last_control_datetime_utc TIMESTAMP NOT NULL,
    last_control_infraction BOOLEAN NOT NULL,
    post_control_comments TEXT,
    number_controls_last_5_years SMALLINT NOT NULL,
    infraction_rate REAL NOT NULL,
    diversion_rate REAL NOT NULL,
    seizure_rate REAL NOT NULL,
    escort_to_quay_rate REAL NOT NULL
);

CREATE INDEX ON public.control_anteriority (vessel_id);
CREATE INDEX ON public.control_anteriority (cfr);
CREATE INDEX ON public.control_anteriority (ircs);
CREATE INDEX ON public.control_anteriority (external_immatriculation);

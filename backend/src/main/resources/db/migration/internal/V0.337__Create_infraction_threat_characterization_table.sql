CREATE TABLE IF NOT EXISTS public.infraction_threat_characterization (
    id SERIAL PRIMARY KEY,
    natinf_code INTEGER NOT NULL,
    threat_id INTEGER NOT NULL,
    threat_characterization_id INTEGER NOT NULL,
    FOREIGN KEY (natinf_code) REFERENCES public.infractions(natinf_code),
    FOREIGN KEY (threat_id) REFERENCES public.threats(id),
    FOREIGN KEY (threat_characterization_id) REFERENCES public.threat_characterizations(id),
    UNIQUE (natinf_code, threat_id, threat_characterization_id)
);

CREATE INDEX ON public.infraction_threat_characterization (natinf_code);
CREATE INDEX ON public.infraction_threat_characterization (threat_id);
CREATE INDEX ON public.infraction_threat_characterization (threat_characterization_id);

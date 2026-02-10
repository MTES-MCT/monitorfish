ALTER TABLE public.infraction_threat_characterization
ADD COLUMN isr_code VARCHAR(10) REFERENCES public.isr(code);

CREATE INDEX ON public.infraction_threat_characterization (isr_code);

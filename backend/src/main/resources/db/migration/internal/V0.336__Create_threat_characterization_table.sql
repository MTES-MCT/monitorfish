CREATE TABLE IF NOT EXISTS public.threat_characterizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE
);

CREATE INDEX ON public.threat_characterizations (name);

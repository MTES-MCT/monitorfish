CREATE TABLE IF NOT EXISTS public.threat_characterizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    threat_id INTEGER NOT NULL REFERENCES threats
);

CREATE INDEX ON public.threat_characterizations (name);

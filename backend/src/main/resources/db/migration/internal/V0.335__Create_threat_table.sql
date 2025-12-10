CREATE TABLE IF NOT EXISTS public.threats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE INDEX ON public.threats (name);

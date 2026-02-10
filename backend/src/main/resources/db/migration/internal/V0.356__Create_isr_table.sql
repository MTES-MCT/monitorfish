CREATE TABLE IF NOT EXISTS public.isr (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT
);

CREATE INDEX ON public.isr (code);

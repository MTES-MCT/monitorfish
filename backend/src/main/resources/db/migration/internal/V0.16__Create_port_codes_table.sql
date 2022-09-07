CREATE TABLE if not exists public.ports (
    country_code_iso2 text,
    region text,
    locode text,
    port_name text,
    latitude double precision,
    longitude double precision
);

ALTER TABLE public.ports DROP CONSTRAINT IF EXISTS ports_pkey;
ALTER TABLE ONLY public.ports ADD CONSTRAINT ports_pkey PRIMARY KEY (locode);
CREATE INDEX ON public.ports (locode);

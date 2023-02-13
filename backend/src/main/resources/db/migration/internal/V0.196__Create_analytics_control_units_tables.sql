CREATE TABLE public.analytics_administrations (
    id integer PRIMARY KEY,
    name character varying NOT NULL
);

CREATE TABLE public.analytics_control_units (
    id integer PRIMARY KEY,
    administration_id integer NOT NULL,
    name character varying NOT NULL,
    archived boolean NOT NULL
);

ALTER TABLE public.analytics_control_units
    ADD CONSTRAINT analytics_control_units_administration_id_fkey 
    FOREIGN KEY (administration_id) REFERENCES public.analytics_administrations(id);

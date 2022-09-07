CREATE TABLE public.transversal_sea_limit_areas (
    id integer NOT NULL,
    geom public.geometry(MultiLineString,4326),
    objnam character varying(254)
);

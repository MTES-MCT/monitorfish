DROP TABLE IF EXISTS public.fao_areas CASCADE;

CREATE TABLE public.fao_areas
(
    wkb_geometry public.geometry(MultiPolygon, 4326),
    f_code       character varying(254),
    f_level      character varying(254),
    f_status     double precision,
    ocean        character varying(254),
    subocean     character varying(254),
    f_area       character varying(254),
    f_subarea    character varying(254),
    f_division   character varying(254),
    f_subdivis   character varying(254),
    f_subunit    character varying(254),
    id           integer PRIMARY KEY,
    name_en      character varying(254),
    name_fr      character varying(254),
    name_es      character varying(254),
    surface      double precision
);


CREATE INDEX fao_areas_wkb_geometry_geom_idx ON public.fao_areas USING gist (wkb_geometry);

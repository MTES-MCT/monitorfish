CREATE TABLE public.brexit_areas
(
    ogc_fid      integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon, 4326),
    id           numeric(10, 0),
    nom          character varying(80)
);

CREATE INDEX brexit_areas_wkb_geometry_geom_idx
    ON public.brexit_areas USING gist (wkb_geometry);

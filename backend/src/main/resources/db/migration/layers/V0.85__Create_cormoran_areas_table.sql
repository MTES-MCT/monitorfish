CREATE TABLE public.cormoran_areas
(
    ogc_fid      integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon, 4326),
    id           double precision,
    zonex        character varying(254)
);

CREATE INDEX cormoran_areas_wkb_geometry_geom_idx
    ON public.cormoran_areas USING gist (wkb_geometry);

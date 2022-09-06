CREATE TABLE public.situ_med_areas
(
    ogc_fid      integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon, 4326),
    libelle      character varying(254)
);

CREATE INDEX situ_med_areas_wkb_geometry_geom_idx
    ON public.situ_med_areas USING gist (wkb_geometry);

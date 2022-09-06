CREATE TABLE public."1241_mer_du_nord_areas"
(
    ogc_fid      integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon, 4326),
    nom          character varying(254),
    "info 1"     character varying(254),
    "info 2"     character varying(254)
);

CREATE INDEX "1241_mer_du_nord_areas_wkb_geometry_geom_idx"
    ON public."1241_mer_du_nord_areas" USING gist (wkb_geometry);

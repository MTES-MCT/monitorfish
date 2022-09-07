CREATE TABLE public."1241_mer_noire_areas" (
    ogc_fid integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon,4326),
    f_code character varying(254),
    f_level character varying(254),
    ocean character varying(254),
    subocean character varying(254)
);

CREATE INDEX "1241_mer_noire_areas_wkb_geometry_geom_idx" 
    ON public."1241_mer_noire_areas" USING gist (wkb_geometry);

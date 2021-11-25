CREATE TABLE public.situ_outre_mer_areas (
    ogc_fid integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon,4326),
    libelle character varying(254)
);

CREATE INDEX situ_outre_mer_areas_wkb_geometry_geom_idx 
    ON public.situ_outre_mer_areas USING gist (wkb_geometry);

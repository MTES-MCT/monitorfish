CREATE TABLE public.fao_iccat_areas (
    ogc_fid integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon,4326),
    fid numeric(33,15),
    objectid numeric(33,15),
    areatype numeric(33,15),
    defrule numeric(33,15),
    disporder numeric(33,15),
    fill numeric(33,15),
    stroke numeric(33,15),
    rfb character varying(254),
    shape_leng numeric(33,15),
    shape_area numeric(33,15),
    ancfeature character varying(254)
);

CREATE INDEX fao_iccat_areas_wkb_geometry_geom_idx 
    ON public.fao_iccat_areas USING gist (wkb_geometry);

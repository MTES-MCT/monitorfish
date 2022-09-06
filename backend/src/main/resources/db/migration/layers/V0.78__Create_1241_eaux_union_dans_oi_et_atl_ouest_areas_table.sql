CREATE TABLE public."1241_eaux_union_dans_oi_et_atl_ouest_areas"
(
    ogc_fid      integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygonZ, 4326),
    name         character varying(254)
);

CREATE INDEX "1241_eaux_union_dans_oi_et_atl_ouest_areas_wkb_geometry_geom_id"
    ON public."1241_eaux_union_dans_oi_et_atl_ouest_areas" USING gist (wkb_geometry);

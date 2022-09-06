CREATE TABLE public.rectangles_stat_areas
(
    ogc_fid      integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiPolygon, 4326),
    id           double precision,
    icesname     character varying(254),
    south        numeric(33, 31),
    west         numeric(33, 31),
    north        numeric(33, 31),
    east         numeric(33, 31),
    area_km2     numeric(9, 0)
);

CREATE INDEX rectangles_stat_areas_wkb_geometry_geom_idx
    ON public.rectangles_stat_areas USING gist (wkb_geometry);

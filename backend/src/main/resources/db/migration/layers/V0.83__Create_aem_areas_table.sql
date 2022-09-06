CREATE TABLE public.aem_areas
(
    ogc_fid      integer PRIMARY KEY,
    wkb_geometry public.geometry(MultiLineStringZ, 4326),
    name         character varying(254),
    descriptio   character varying(254),
    "timestamp"  character varying(24),
    begin        character varying(24),
    "end"        character varying(24),
    altitudemo   character varying(254),
    tessellate   numeric(10, 0),
    extrude      numeric(10, 0),
    visibility   numeric(10, 0),
    draworder    numeric(10, 0),
    icon         character varying(254),
    layer        character varying(100),
    path         character varying(200)
);


CREATE INDEX aem_areas_wkb_geometry_geom_idx
    ON public.aem_areas USING gist (wkb_geometry);

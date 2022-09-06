DROP TABLE IF EXISTS public.facade_areas;

CREATE TABLE public.facade_areas
(
    facade   text,
    geometry public.geometry(MultiPolygon, 4326)
);

CREATE INDEX facade_areas_geometry_geom_idx ON public.facade_areas USING gist (geometry);

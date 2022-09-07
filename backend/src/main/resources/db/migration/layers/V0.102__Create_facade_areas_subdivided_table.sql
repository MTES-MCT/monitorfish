CREATE TABLE public.facade_areas_subdivided
(
    facade text,
    geometry public.geometry(Polygon,4326)
);

CREATE INDEX facade_areas_subdivided_geometry_idx ON public.facade_areas_subdivided USING gist (geometry);
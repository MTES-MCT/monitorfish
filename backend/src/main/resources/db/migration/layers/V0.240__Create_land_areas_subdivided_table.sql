CREATE TABLE public.land_areas_subdivided
(
    id INTEGER PRIMARY KEY,
    geometry public.geometry(Polygon,4326)
);

CREATE INDEX land_areas_subdivided_geometry_idx ON public.land_areas_subdivided USING gist (geometry);
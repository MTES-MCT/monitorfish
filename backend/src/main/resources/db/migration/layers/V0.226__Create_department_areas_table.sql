CREATE TABLE public.departments_areas (
    insee_dep VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);

CREATE INDEX "departments_areas_geometry_geom_idx" ON public.departments_areas USING GIST (geometry);
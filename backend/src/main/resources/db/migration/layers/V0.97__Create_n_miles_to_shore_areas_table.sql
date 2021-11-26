CREATE TABLE public.n_miles_to_shore_areas
(
    area character varying(100) NOT NULL,
    miles_to_shore character varying(100) NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);

CREATE INDEX n_miles_to_shore_areas_geometry_idx
    ON prod.n_miles_to_shore_areas USING gist (geometry);
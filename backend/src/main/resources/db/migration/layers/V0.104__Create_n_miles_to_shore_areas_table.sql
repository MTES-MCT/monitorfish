CREATE TABLE public.n_miles_to_shore_areas_subdivided
(
    area           character varying(100) NOT NULL,
    miles_to_shore character varying(100) NOT NULL,
    geometry       public.geometry(Polygon, 4326)
);

CREATE INDEX n_miles_to_shore_areas_subdivided_geometry_idx
    ON public.n_miles_to_shore_areas_subdivided USING gist (geometry);

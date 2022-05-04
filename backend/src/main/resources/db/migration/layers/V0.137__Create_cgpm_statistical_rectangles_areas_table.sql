CREATE TABLE public."cgpm_statistical_rectangles_areas" (
    id integer NOT NULL,
    geom public.geometry(MultiPolygon,4326),
    objectid integer,
    fao_area double precision,
    sect_cod character varying(80),
    shape_leng double precision,
    shape_area double precision
);

ALTER TABLE ONLY public."cgpm_statistical_rectangles_areas"
    ADD CONSTRAINT "cgpm_statistical_rectangles_areas_pkey" PRIMARY KEY (id);
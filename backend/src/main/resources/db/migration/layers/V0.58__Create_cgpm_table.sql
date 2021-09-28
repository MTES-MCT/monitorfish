CREATE TABLE public.cgpm_areas (
    "F_AREA" text,
    "F_SUBAREA" text,
    "F_DIVISION" text,
    "SECT_COD" text,
    "TSECT_COD" double precision,
    "SMU_NAME" text,
    "SMU_NAME_F" text,
    "F_GSA" text,
    "F_GSA_LIB" text,
    "CENTER_X" double precision,
    "CENTER_Y" double precision,
    "SMU_CODE" double precision,
    geometry public.geometry(Geometry,4326)
);

CREATE INDEX idx_cgpm_geometry ON public.cgpm USING gist (geometry);

ALTER TABLE public.fao_areas
    DROP COLUMN id;
ALTER TABLE fao_areas
    ADD CONSTRAINT fao_areas_pkey PRIMARY KEY (f_code);

ALTER TABLE public.controls
    DROP COLUMN fao_area,
    ADD COLUMN fao_areas VARCHAR(100)[];

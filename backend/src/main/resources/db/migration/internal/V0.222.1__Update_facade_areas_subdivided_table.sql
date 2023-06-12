ALTER TABLE public.facade_areas_subdivided
    ADD COLUMN id serial;

ALTER TABLE public.facade_areas_subdivided
ALTER COLUMN facade SET NOT NULL;

ALTER TABLE public.facade_areas_subdivided
ALTER COLUMN geometry SET NOT NULL;

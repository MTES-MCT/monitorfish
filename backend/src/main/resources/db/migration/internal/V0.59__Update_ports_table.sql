ALTER TABLE public.ports
    DROP COLUMN stationary_vessels_h3_res9,
    ADD COLUMN facade VARCHAR(100),
    ADD COLUMN fao_areas VARCHAR(100)[];
ALTER TABLE public.eez_areas
    ALTER COLUMN wkb_geometry TYPE public.geometry(MultiPolygon, 4326) USING ST_SetSRID(wkb_geometry,4326);
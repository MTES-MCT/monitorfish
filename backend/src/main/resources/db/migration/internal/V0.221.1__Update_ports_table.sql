ALTER TABLE public.ports
    ALTER COLUMN facade TYPE facade USING facade::facade;

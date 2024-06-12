ALTER TABLE public.vessels
    ADD COLUMN logbook_equipment_status VARCHAR,
    ADD COLUMN has_esacapt BOOLEAN NOT NULL DEFAULT false;

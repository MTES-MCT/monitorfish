ALTER TABLE public.alerts
    ADD COLUMN vessel_name character varying(100),
    DROP COLUMN name;
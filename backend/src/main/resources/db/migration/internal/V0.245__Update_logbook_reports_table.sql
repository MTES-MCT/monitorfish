ALTER TABLE public.logbook_reports
    ADD COLUMN enriched BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN trip_gears jsonb,
    ADD COLUMN pno_types jsonb,
    ADD COLUMN trip_segments VARCHAR[];

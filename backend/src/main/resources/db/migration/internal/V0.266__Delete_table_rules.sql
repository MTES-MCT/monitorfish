DROP TABLE public.rules;

ALTER TABLE public.logbook_reports
    DROP COLUMN analyzed_by_rules;

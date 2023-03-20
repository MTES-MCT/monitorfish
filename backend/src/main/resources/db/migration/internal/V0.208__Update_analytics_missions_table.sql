ALTER TABLE public.analytics_missions ADD COLUMN mission_types text[];
UPDATE public.analytics_missions SET mission_types = ARRAY[mission_type];
ALTER TABLE public.analytics_missions DROP COLUMN mission_type;
UPDATE public.reportings
SET value = jsonb_set(value, '{flagState}', '"FR"')
WHERE value->>'flagState' is null;

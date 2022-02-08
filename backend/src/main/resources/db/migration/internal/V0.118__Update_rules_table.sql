UPDATE public.rules
SET value = jsonb_set(value, '{inputSource}', '"Logbook"')
WHERE value->>'inputSource' = 'ERS';
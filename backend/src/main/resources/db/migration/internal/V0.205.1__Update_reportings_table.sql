UPDATE public.reportings
SET value = jsonb_strip_nulls(
    jsonb_set(
        value,
        '{natinfCode}',
        CASE
            WHEN value->>'natinfCode' IS NULL OR value->>'natinfCode' = '' THEN 'null'
            ELSE to_jsonb((value->>'natinfCode')::INTEGER)
        END,
        false
    )
);

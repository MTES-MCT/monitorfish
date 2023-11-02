UPDATE reportings
    SET value = jsonb_set(value, '{controlUnitId}', 'null')
    WHERE value->>'controlUnitId' = '';

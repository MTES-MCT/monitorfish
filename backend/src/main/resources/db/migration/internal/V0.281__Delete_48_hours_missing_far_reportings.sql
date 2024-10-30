DELETE FROM reportings
WHERE value->>'type' == 'MISSING_FAR_48_HOURS_ALERT';

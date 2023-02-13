UPDATE reportings r
SET value = jsonb_set(value, '{unit}', to_jsonb((
    SELECT controllers.id
    FROM controllers
    WHERE controllers.controller = r.value->>'unit'
)))
WHERE value->>'unit' != '';

UPDATE reportings
SET value = (REPLACE(value::TEXT, '"unit"', '"controlUnitId"'))::JSONB
RETURNING *;

DROP TABLE controllers;

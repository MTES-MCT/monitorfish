-- Convert single-infraction JSONB format to list format (idempotent).
-- Rows that already have an "infractions" key are skipped.
UPDATE reportings
SET value = jsonb_set(
    value,
    '{infractions}',
    jsonb_build_array(
        jsonb_build_object(
            'natinfCode',             (value ->> 'natinfCode')::int,
            'threat',                 COALESCE(value ->> 'threat', 'Famille inconnue'),
            'threatCharacterization', COALESCE(value ->> 'threatCharacterization', 'Type inconnu')
        )
    )
)
WHERE type = 'INFRACTION_SUSPICION'
  AND value ? 'natinfCode'
  AND NOT (value ? 'infractions');

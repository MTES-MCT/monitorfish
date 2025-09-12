UPDATE vessel_groups
SET filters = (
    filters
    - 'lastControlPeriod'  -- remove old key
    || jsonb_build_object(
        'lastControlAtSeaPeriod', filters->'lastControlPeriod',
        'lastControlAtQuayPeriod', filters->'lastControlPeriod'
    )
)
WHERE filters ? 'lastControlPeriod';

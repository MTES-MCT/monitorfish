UPDATE position_alerts
SET
    description = 'Pour tous les navires en pêche dans la zone des 3 milles hors zones de dérogation et ayant déclaré un chalut dans un FAR de leur marée et d''une marée récente (moins de 2 semaines).',
    name = 'Chalutage dans les 3 milles (hors zones de dérogation)'
WHERE name = 'Chalutage dans les 3 milles';

-- Same alert as above, restricted to the 3 nm derogation areas.
-- All other attributes (gears, natinf, depth of analysis...) are copied from the existing alert.
INSERT INTO position_alerts (
    name,
    description,
    is_user_defined,
    natinf_code,
    is_activated,
    is_in_error,
    is_deleted,
    has_automatic_archiving,
    created_by,
    created_at_utc,
    error_reason,
    validity_start_datetime_utc,
    validity_end_datetime_utc,
    repeat_each_year,
    track_analysis_depth,
    only_fishing_positions,
    gears,
    species,
    species_catch_areas,
    administrative_areas,
    regulatory_areas,
    min_depth,
    flag_states_iso2,
    vessel_ids,
    excluded_vessel_ids,
    district_codes,
    producer_organizations,
    threat_characterization,
    threat,
    is_deleted_after_validity_period
)
SELECT
    'Chalutage dans les 3 milles (zones de dérogation)',
    'Pour tous les navires en pêche dans les zones de dérogation de la zone des 3 milles et ayant déclaré un chalut dans un FAR de leur marée et d''une marée récente (moins de 2 semaines).',
    is_user_defined,
    natinf_code,
    is_activated,
    is_in_error,
    is_deleted,
    has_automatic_archiving,
    created_by,
    NOW() AT TIME ZONE 'UTC',
    error_reason,
    validity_start_datetime_utc,
    validity_end_datetime_utc,
    repeat_each_year,
    track_analysis_depth,
    only_fishing_positions,
    gears,
    species,
    species_catch_areas,
    '[{"areas": ["0-3_DEROG_AREAS"], "areaType": "DISTANCE_TO_SHORE"}]'::jsonb,
    regulatory_areas,
    min_depth,
    flag_states_iso2,
    vessel_ids,
    excluded_vessel_ids,
    district_codes,
    producer_organizations,
    threat_characterization,
    threat,
    is_deleted_after_validity_period
FROM position_alerts
WHERE name = 'Chalutage dans les 3 milles (hors zones de dérogation)';

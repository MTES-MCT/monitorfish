SELECT
    id,
    name,
    description,
    natinf_code,
    is_activated,
    is_in_error,
    error_reason,
    validity_start_datetime_utc,
    validity_end_datetime_utc,
    repeat_each_year,
    track_analysis_depth,
    only_fishing_positions,
    gears,
    species,
    administrative_areas,
    regulatory_areas,
    min_depth,
    flag_states_iso2,
    vessel_ids,
    district_codes,
    producer_organizations
FROM position_alerts
WHERE is_deleted IS FALSE
ORDER BY id
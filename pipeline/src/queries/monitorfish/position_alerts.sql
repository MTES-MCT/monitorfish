SELECT
    id,
    name,
    description,
    natinf_code,
    threat,
    threat_characterization,
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
    species_catch_areas,
    administrative_areas,
    regulatory_areas,
    min_depth,
    flag_states_iso2,
    vessel_ids,
    district_codes,
    producer_organizations
FROM position_alerts
WHERE
    NOT is_deleted AND
    is_activated AND (
        gears != '[]'
        OR species != '[]'
        OR species_catch_areas != '{}'
        OR administrative_areas != '[]'
        OR regulatory_areas != '[]'
        OR flag_states_iso2 != '{}'
        OR vessel_ids != '{}'
        OR district_codes != '{}'
        OR producer_organizations != '{}'
    )
ORDER BY id
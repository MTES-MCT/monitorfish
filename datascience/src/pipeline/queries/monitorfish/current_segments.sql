SELECT
    cfr,
    last_ers_datetime_utc,
    departure_datetime_utc,
    trip_number,
    gear_onboard,
    species_onboard,
    segments,
    total_weight_onboard,
    risk_factor as segment_risk_factor,
    control_priority_level
FROM public.current_segments
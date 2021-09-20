SELECT
    cfr,
    last_ers_datetime_utc,
    departure_datetime_utc,
    trip_number,
    gear_onboard,
    species_onboard,
    segments,
    total_weight_onboard,
    impact_risk_factor,
    control_priority_level
FROM public.current_segments
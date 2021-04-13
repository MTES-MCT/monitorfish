SELECT
    cfr,
    departure_datetime_utc,
    trip_number AS ers_trip_number,
    gear_onboard,
    species_onboard,
    segments,
    total_weight_onboard
FROM public.current_segments
WITH last_54_hours_positions AS (
    SELECT 
        id,
        internal_reference_number,
        external_reference_number,
        mmsi,
        ircs,
        vessel_name,
        flag_state,
        from_country,
        destination_country,
        trip_number,
        latitude,
        longitude,
        speed,
        course,
        date_time,
        position_type,
        ROW_NUMBER() OVER (
            PARTITION BY internal_reference_number, external_reference_number 
            ORDER BY id DESC) AS rk
    FROM positions
    WHERE date_time > CURRENT_TIMESTAMP - INTERVAL '2 days 6 hours'
    AND (internal_reference_number IS NOT NULL OR 
         external_reference_number IS NOT NULL)
),

last_two_positions AS (
    SELECT 
        id,
        COALESCE(internal_reference_number, '') AS internal_reference_number,
        COALESCE(external_reference_number, '') AS external_reference_number,
        mmsi,
        ircs,
        vessel_name,
        flag_state,
        from_country,
        destination_country,
        trip_number,
        latitude,
        longitude,
        speed,
        course,
        date_time,
        position_type,
        rk
    FROM last_54_hours_positions
    WHERE rk <=2
),

last_positions AS (
    SELECT *
    FROM last_two_positions
    WHERE rk = 1
),

emission_periods AS (
    SELECT
        internal_reference_number,
        external_reference_number,
        (MAX(date_time) - MIN(date_time)) / NULLIF(COUNT(id) - 1, 0) AS emission_period
    FROM last_two_positions
    GROUP BY 
        internal_reference_number,
        external_reference_number
),

vessels_ AS (
    SELECT
        cfr,
        width,
        length,
        mmsi,
        district,
        district_code,
        registry_port
    FROM public.vessels
    WHERE cfr IS NOT NULL
)

SELECT
    pos.id,
    pos.internal_reference_number,
    pos.external_reference_number,
    vessels_.mmsi,
    pos.ircs,
    pos.vessel_name,
    pos.flag_state,
    vessels_.district_code,
    vessels_.district,
    vessels_.registry_port,
    vessels_.width,
    vessels_.length,
    pos.from_country,
    pos.destination_country,
    pos.trip_number,
    pos.latitude,
    pos.longitude,
    pos.speed,
    pos.course,
    pos.date_time,
    pos.position_type,
    per.emission_period
FROM last_positions pos
LEFT JOIN emission_periods per
ON (
        pos.internal_reference_number = per.internal_reference_number
    AND pos.external_reference_number = per.external_reference_number)
LEFT JOIN vessels_
ON pos.internal_reference_number = vessels_.cfr



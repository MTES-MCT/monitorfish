WITH last_n_minutes_positions AS (
    SELECT 
        id,
        internal_reference_number,
        external_reference_number,
        mmsi,
        ircs,
        vessel_name,
        flag_state,
        latitude,
        longitude,
        speed,
        course,
        date_time,
        ROW_NUMBER() OVER (
            PARTITION BY internal_reference_number, external_reference_number, ircs
            ORDER BY date_time DESC) AS rk
    FROM positions
    WHERE date_time > CURRENT_TIMESTAMP - make_interval(mins => :minutes)
    AND date_time < CURRENT_TIMESTAMP + INTERVAL '1 day'
    AND (internal_reference_number IS NOT NULL OR 
         external_reference_number IS NOT NULL OR
         ircs IS NOT NULL)
),

last_two_positions AS (
    SELECT 
        id,
        internal_reference_number,
        external_reference_number,
        mmsi,
        ircs,
        vessel_name,
        flag_state,
        latitude,
        longitude,
        speed,
        course,
        date_time,
        rk
    FROM last_n_minutes_positions
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
        ircs,
        (MAX(date_time) - MIN(date_time)) / NULLIF(COUNT(id) - 1, 0) AS emission_period
    FROM last_two_positions
    GROUP BY 
        internal_reference_number,
        external_reference_number,
        ircs
)

SELECT
    pos.id,
    pos.internal_reference_number AS cfr,
    pos.external_reference_number AS external_immatriculation,
    vessels.mmsi,
    pos.ircs,
    pos.vessel_name,
    pos.flag_state,
    vessels.district_code,
    vessels.district,
    vessels.registry_port,
    vessels.width,
    vessels.length,
    vessels.under_charter,
    pos.latitude,
    pos.longitude,
    pos.speed,
    pos.course,
    pos.date_time AS last_position_datetime_utc,
    per.emission_period
FROM last_positions pos
LEFT JOIN emission_periods per
ON (
        pos.internal_reference_number = per.internal_reference_number
    AND pos.external_reference_number = per.external_reference_number)
LEFT JOIN vessels
ON pos.internal_reference_number = vessels.cfr
WHERE pos.flag_state != 'GB' OR pos.latitude < 46.2294 OR pos.latitude > 46.2305 

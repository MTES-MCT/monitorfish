WITH controls_ AS  (
SELECT
    id,
    vessel_id,
    control_datetime_utc,
    ROW_NUMBER() OVER(PARTITION BY vessel_id ORDER BY control_datetime_utc DESC) as rk,
    CASE WHEN (infraction = true OR infraction_ids != '{}') THEN true ELSE false END AS infraction,
    diversion,
    seizure,
    escort_to_quay
FROM controls
WHERE control_datetime_utc IS NOT NULL 
AND control_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '5 years'
),

stats AS (
    SELECT
        vessel_id,
        COUNT(id) AS number_controls_last_5_years,
        SUM(CASE WHEN infraction THEN 1 ELSE 0 END)::DOUBLE PRECISION / COUNT(id) AS infraction_rate,
        SUM(CASE WHEN diversion THEN 1 ELSE 0 END)::DOUBLE PRECISION / COUNT(id) AS diversion_rate,
        SUM(CASE WHEN seizure THEN 1 ELSE 0 END)::DOUBLE PRECISION / COUNT(id) AS seizure_rate,
        SUM(CASE WHEN escort_to_quay THEN 1 ELSE 0 END)::DOUBLE PRECISION / COUNT(id) AS escort_to_quay_rate
    FROM controls_
    GROUP BY vessel_id
),

last_control AS (
    SELECT 
        vessel_id,
        control_datetime_utc AS last_control_datetime_utc,
        infraction AS last_control_infraction
    FROM controls_
    WHERE rk=1
)

SELECT
    stats.vessel_id,
    v.cfr,
    v.ircs,
    v.external_immatriculation,
    v.flag_state,
    v.vessel_name,
    l.last_control_datetime_utc,
    l.last_control_infraction,
    stats.number_controls_last_5_years,
    stats.infraction_rate,
    stats.diversion_rate,
    stats.seizure_rate,
    stats.escort_to_quay_rate
FROM stats
LEFT JOIN vessels v
ON stats.vessel_id = v.id
LEFT JOIN last_control l
ON l.vessel_id = stats.vessel_id
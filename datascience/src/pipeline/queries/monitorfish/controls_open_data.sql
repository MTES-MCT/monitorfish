WITH controls_agg AS (
    select
        EXTRACT(YEAR FROM control_datetime_utc) AS control_year,
        analytics_control_types.control_type,
        analytics_facade_names.facade,
        analytics_segment_names.segment,
        EXTRACT(MONTH FROM control_datetime_utc) AS control_month,
        COUNT(*) AS number_controls,
        (SUM(CASE WHEN infraction IS true THEN 1.0 ELSE 0.0 END)::DOUBLE PRECISION) / (COUNT(*)::DOUBLE PRECISION) AS infraction_rate
    FROM analytics_controls
    LEFT JOIN analytics_segment_names
    ON analytics_segment_names.segment = ANY (analytics_controls.segments)
    LEFT JOIN analytics_facade_names
    ON analytics_facade_names.facade = analytics_controls.facade
    LEFT JOIN analytics_control_types
    ON analytics_control_types.control_type = analytics_controls.control_type
    LEFT JOIN controllers
    ON analytics_controls.controller_id = controllers.id
    GROUP BY
        EXTRACT(YEAR FROM control_datetime_utc),
        analytics_control_types.control_type,
        analytics_facade_names.facade,
        analytics_segment_names.segment,
        EXTRACT(MONTH FROM control_datetime_utc)
    ORDER BY
        EXTRACT(YEAR FROM control_datetime_utc),
        analytics_control_types.control_type,
        analytics_facade_names.facade,
        analytics_segment_names.segment,
        EXTRACT(MONTH FROM control_datetime_utc)

),

controls_agg_cum AS (
    SELECT
        *,
        SUM(number_controls) OVER (PARTITION BY control_year, control_type, facade, segment ORDER BY control_month) AS number_controls_ytd,
        SUM(number_controls * infraction_rate) OVER (PARTITION BY control_year, control_type, facade, segment ORDER BY control_month) / SUM(number_controls) OVER (PARTITION BY control_year, control_type, facade, segment ORDER BY control_month) AS infraction_rate_ytd
    FROM controls_agg
),


targets_at_port AS (
    SELECT
        year,
        'Contrôle à la débarque' AS control_type,
        facade,
        segment,
        target_number_of_controls_at_port AS target_number_of_controls_year
    FROM control_objectives
),

targets_at_sea AS (
    SELECT 
        year,
        'Contrôle à la mer' AS control_type,
        facade,
        segment,
        target_number_of_controls_at_sea AS target_number_of_controls_year
    FROM control_objectives
),

targets AS (
    SELECT * FROM targets_at_port
    UNION ALL
    SELECT * FROM targets_at_sea
)

SELECT
    controls_agg_cum.control_year,
    controls_agg_cum.control_type,
    controls_agg_cum.facade,
    controls_agg_cum.segment,
    controls_agg_cum.control_month,
    controls_agg_cum.number_controls,
    controls_agg_cum.number_controls_ytd,
    targets.target_number_of_controls_year,
    controls_agg_cum.infraction_rate,
    controls_agg_cum.infraction_rate_ytd
FROM controls_agg_cum
LEFT JOIN targets
ON 
    targets.year = controls_agg_cum.control_year AND
    targets.control_type = controls_agg_cum.control_type AND
    targets.facade = controls_agg_cum.facade AND
    targets.segment = controls_agg_cum.segment
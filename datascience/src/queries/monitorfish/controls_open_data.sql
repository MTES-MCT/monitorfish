WITH controls_segment AS (
    SELECT
        id,
        EXTRACT(YEAR FROM control_datetime_utc) AS control_year,
        EXTRACT(MONTH FROM control_datetime_utc) AS control_month,
        control_type,
        facade,
        jsonb_array_elements(
            COALESCE(
                NULLIF(
                    NULLIF(
                        segments,
                        'null'
                    ),
                    '[]'
                ),
                '[{"segment": "Hors segment"}]'
            )
        )->>'segment' AS segment,
        infraction
    FROM analytics_controls
),

 controls_agg AS (
    select
        control_year,
        control_month,
        control_type,
        facade,
        segment,
        COUNT(*) AS number_controls,
        (SUM(CASE WHEN infraction IS true THEN 1.0 ELSE 0.0 END)::DOUBLE PRECISION) / (COUNT(*)::DOUBLE PRECISION) AS infraction_rate
    FROM controls_segment
    GROUP BY
        control_year,
        control_month,
        control_type,
        facade,
        segment
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
ORDER BY
    control_year,
    control_type,
    facade,
    segment,
    control_month
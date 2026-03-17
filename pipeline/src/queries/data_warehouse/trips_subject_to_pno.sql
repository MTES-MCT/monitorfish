WITH fra_catches AS (
    SELECT
        c.cfr,
        c.trip_number,
        t.pno_type_name,
        t.minimum_notification_period,
        t.has_designated_ports,
        t.minimum_quantity_kg,
        COALESCE(weight, 0) AS weight_
    FROM monitorfish.catches c
    JOIN monitorfish.pno_type_rules_unnested t
    ON
        (c.species = t.species)
        AND (c.fao_area LIKE t.fao_area || '%')
        AND t.gear IS NULL
    WHERE
        c.far_datetime_utc >= {from_datetime_utc:DateTime}
        AND c.flag_state = 'FRA'
),

fra_trips_requiring_pno AS (
    SELECT
        cfr,
        trip_number,
        pno_type_name,
        minimum_notification_period,
        minimum_quantity_kg,
        SUM(weight_) AS weight
    FROM fra_catches
    GROUP BY 1, 2, 3, 4, 5
    HAVING SUM(weight_) >= minimum_quantity_kg
    ORDER BY 1, 2, 3
)

SELECT
    cfr,
    trip_number,
    MAX(minimum_notification_period) AS minimum_notification_period_
FROM fra_trips_requiring_pno
GROUP BY 1, 2
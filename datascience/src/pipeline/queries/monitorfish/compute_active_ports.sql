WITH pno_lan_ports AS (
    SELECT
            value->>'port' AS port,
            SUM(CASE WHEN log_type = 'PNO' THEN 1 ELSE 0 END) AS number_of_pnos_since_2022,
            SUM(CASE WHEN log_type = 'LAN' THEN 1 ELSE 0 END) AS number_of_lans_since_2022
    FROM logbook_reports
    WHERE
            log_type IN ('PNO', 'LAN') AND
            operation_datetime_utc > '2022-01-01'
    GROUP BY
            value->>'port'
),

     control_ports AS (
         SELECT
             port_locode AS port,
             COUNT(*) AS number_of_controls_since_2018
         FROM mission_actions
         WHERE action_type = 'LAND_CONTROL' AND action_datetime_utc > '2018-01-01'
         GROUP BY port_locode, latitude, longitude
     )

SELECT
    COALESCE(pno_lan_ports.port, control_ports.port) AS port_locode,
    true as is_active
FROM pno_lan_ports
         FULL OUTER JOIN control_ports
                         ON pno_lan_ports.port = control_ports.port
         LEFT JOIN ports
                   ON ports.locode = COALESCE(pno_lan_ports.port, control_ports.port)
ORDER BY COALESCE(number_of_controls_since_2018, 0) DESC, COALESCE(number_of_lans_since_2022, 0) DESC

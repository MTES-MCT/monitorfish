WITH pno_lan_ports AS (
    SELECT DISTINCT ON (value->>'port')
        value->>'port' AS locode,
        true AS is_active
    FROM logbook_reports
    WHERE
        log_type IN ('PNO', 'LAN') AND
        operation_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '2 years'
),

control_ports AS (
    SELECT DISTINCT ON (port_locode)
        port_locode AS locode,
        true AS is_active
    FROM mission_actions
    WHERE
        action_type = 'LAND_CONTROL' AND
        action_datetime_utc > CURRENT_TIMESTAMP - INTERVAL '5 years'
)

SELECT
    ports.locode,
    COALESCE(pno_lan_ports.is_active, control_ports.is_active, false) AS is_active
FROM ports
LEFT JOIN pno_lan_ports
ON pno_lan_ports.locode = ports.locode
LEFT JOIN control_ports
ON control_ports.locode = ports.locode
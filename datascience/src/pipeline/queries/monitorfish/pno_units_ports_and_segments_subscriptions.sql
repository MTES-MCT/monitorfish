WITH units_segments AS (
    SELECT
        control_unit_id,
        ARRAY_AGG(segment) AS unit_subscribed_segments
    FROM pno_segments_subscriptions
    GROUP BY control_unit_id
)

SELECT
    p.port_locode,
    p.control_unit_id,
    p.receive_all_pnos AS receive_all_pnos_from_port,
    COALESCE(s.unit_subscribed_segments, '{}'::VARCHAR[]) AS unit_subscribed_segments
FROM pno_ports_subscriptions p
LEFT JOIN units_segments s
ON p.control_unit_id = s.control_unit_id
ORDER BY port_locode, control_unit_id
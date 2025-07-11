SELECT
    t.id AS pno_type_id,
    t.name AS pno_type_name,
    t.minimum_notification_period,
    t.has_designated_ports,
    r.id AS pno_type_rule_id,
    r.species,
    r.fao_areas,
    r.gears,
    r.flag_states,
    r.minimum_quantity_kg
FROM pno_types t
JOIN pno_type_rules r
ON t.id = r.pno_type_id
ORDER BY t.id, r.id
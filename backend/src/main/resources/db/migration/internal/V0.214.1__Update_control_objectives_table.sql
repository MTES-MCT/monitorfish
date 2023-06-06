INSERT INTO control_objectives (facade, segment, year, target_number_of_controls_at_sea,
                                target_number_of_controls_at_port, control_priority_level)
SELECT 'CORSE' as facade, segment, year, target_number_of_controls_at_sea,
        target_number_of_controls_at_port, control_priority_level FROM control_objectives
WHERE facade = 'MED';

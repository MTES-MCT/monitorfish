DELETE FROM public.control_objectives;

INSERT INTO public.control_objectives (facade, segment, year, target_number_of_controls_at_sea, target_number_of_controls_at_port, control_priority_level, id) VALUES 
('SA', 'SWW01/02/03', EXTRACT(year FROM CURRENT_TIMESTAMP) - 1, 159, 63, 2, 153),
('SA', 'SWW04', EXTRACT(year FROM CURRENT_TIMESTAMP) - 1, 3, 0, 2, 154),
('SA', 'SWW01/02/03', EXTRACT(year FROM CURRENT_TIMESTAMP), 139, 43, 1, 155),
('SA', 'SWW04', EXTRACT(year FROM CURRENT_TIMESTAMP), 23, 10, 3, 156);

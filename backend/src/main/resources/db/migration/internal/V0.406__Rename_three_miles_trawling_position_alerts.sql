UPDATE position_alerts
SET name = 'Chalutage dans les 3 mn hors zone de dérogation'
WHERE name = 'Chalutage dans les 3 milles (hors zones de dérogation)';

UPDATE position_alerts
SET name = 'Chalutage dans les 3 mn en zone de dérogation'
WHERE name = 'Chalutage dans les 3 milles (zones de dérogation)';

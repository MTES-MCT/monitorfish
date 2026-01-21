UPDATE control_objectives
SET infringement_risk_level = 3.0
WHERE segment LIKE 'NWW%';

UPDATE control_objectives
SET infringement_risk_level = 4.0
WHERE segment LIKE 'MED%';

UPDATE control_objectives
SET infringement_risk_level = 1.0
WHERE segment LIKE 'NS%';

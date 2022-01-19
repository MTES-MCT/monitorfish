DELETE FROM fishing_gear_codes;

INSERT INTO fishing_gear_codes
(fishing_gear_code, fishing_gear, fishing_gear_category) 
VALUES 
('PS', 'Sennes coulissantes', 'Sennes tournantes coulissantes'),
('PS1', 'Sennes coulissantes manœuvrées par un navire', 'Sennes tournantes coulissantes'),
('OTT', 'Chaluts jumeaux à panneaux', 'Chaluts'),
('OTM', 'Chaluts pélagiques à panneaux', 'Chaluts'),
('OTB', 'Chaluts de fond à panneaux', 'Chaluts'),
('DRB', 'Dragues remorquées par bateau', 'Dragues'),
('GTR', 'Trémails', 'Filets maillants et filets emmêlants'),
('GNS', 'Filets maillants calés (ancrés)', 'Filets maillants et filets emmêlants'),
('LLS', 'Palangres calées', 'Lignes et hameçons');

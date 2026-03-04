DELETE FROM threat_characterizations;
DELETE FROM threats;

INSERT INTO threats (id, name) VALUES 
    (1, 'Activités INN'),
    (2, 'Entrave au contrôle'),
    (3, 'Mesures techniques et de conservation'),
    (4, 'Terres Australes'),
    (5, 'Obligation de débarquement'),
    (6, 'Obligations déclaratives'),
    (7, 'Sécurité / gens de mer');

INSERT INTO threat_characterizations (id, name, threat_id) VALUES 
    (1, 'VMS', 6),
    (2, 'Zone interdite', 3),
    (3, 'DEP', 6),
    (4, 'FAR (JPE)', 6),
    (5, 'JPE non fonctionnel / absent', 6),
    (6, 'Marge de tolérance', 6),
    (7, 'PNO', 6);
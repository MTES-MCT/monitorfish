DELETE FROM infractions;

INSERT INTO infractions (
    natinf_code,    regulation, infraction_category,    infraction) VALUES
       ('22206', 'Reg pêche 1',             'Pêche', 'Infraction 1'),
       ('27724', 'Reg pêche 5',             'Pêche', 'Infraction 2'),
       ('22222', 'Reg pêche 2',             'Pêche', 'Infraction 3'),
       (   '17', 'Reg pêche 3',             'Pêche', 'Infraction 4'),
       ( '1030', 'Reg pêche 1',             'Pêche', 'Infraction 5'),
       ( '1000', 'Reg pêche 1',   'Sécurité / Rôle', 'Infraction 6'),
       ( '2000', 'Reg pêche 2',   'Sécurité / Rôle', 'Infraction 7'),
       ( '3000', 'Reg pêche 2',     'Environnement', 'Infraction 8'),
       ( '4000', 'Reg pêche 9',     'Environnement', 'Infraction 9');

DELETE FROM districts;

INSERT INTO districts (
    district_code,     district, department_code,         department,      dml, facade
) VALUES
(            'CC', 'Concarneau',              29,        'Finistère', 'DML 29', 'NAMO'),
(            'MA',  'Marseille',              13, 'Bouches-du-Rhône', 'DML 13',  'MED');

DELETE FROM public.ports;

INSERT INTO public.ports (
    country_code_iso2, region,     locode,                    port_name, is_active, facade) VALUES 
    (            'FR',   '56',     'FAKE', 'Fake Port initially active',      true, 'NAMO'),
    (            'FR',   '56', 'PNO_PORT',         'Fake Port with PNO',     false,   NULL),
    (            'FR',   '56', 'LAN_PORT',         'Fake Port with LAN',     false, 'NAMO'),
    (            'FR',  '999',    'FRCQF', 'Somewhere over the rainbow',     false, 'NAMO'),
    (            'FR',  '999',    'FRBES',    'Somewhere over the hill',     false,   'SA'),
    (            'FR',  '999',    'FRDPE',  'Somewhere over the clouds',     false,   NULL),
    (            'FR',  '999',    'FRDKK',   'Somewhere over the swell',     false, 'NAMO'),
    (            'FR',  '999',    'FRLEH',   'Somewhere over the ocean',     false,   'SA'),
    (            'FR',  '999',    'FRZJZ',     'Somewhere over the top',     false,   'SA'),
    (            'FR',  '999',    'GBPHD',           'Port with facade',     false, 'MEMN');
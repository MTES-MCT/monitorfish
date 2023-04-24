DELETE FROM public.ports;

INSERT INTO public.ports (
    country_code_iso2, region,     locode,                    port_name, is_active) VALUES 
    (            'FR',   '56',     'FAKE', 'Fake Port initially active',      true),
    (            'FR',   '56', 'PNO_PORT',         'Fake Port with PNO',     false),
    (            'FR',   '56', 'LAN_PORT',         'Fake Port with LAN',     false),
    (            'FR',  '999',    'FRCQF', 'Somewhere over the rainbow',     false),
    (            'FR',  '999',    'FRBES',    'Somewhere over the hill',     false),
    (            'FR',  '999',    'FRDPE',  'Somewhere over the clouds',     false),
    (            'FR',  '999',    'FRDKK',   'Somewhere over the swell',     false),
    (            'FR',  '999',    'FRLEH',   'Somewhere over the ocean',     false),
    (            'FR',  '999',    'FRZJZ',     'Somewhere over the top',     false);
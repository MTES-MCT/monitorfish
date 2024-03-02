INSERT INTO public.pno_types (
    id                                name, minimum_notification_period, has_designated_ports) VALUES 
    (1,                   'Préavis type 1',                           4,                 true),
    (2,                   'Préavis type 2',                           4,                 true),
    (3,             'Préavis par pavillon',                           4,                 true),
    (4,                'Préavis par engin',                           4,                 true);

ALTER SEQUENCE pno_types_id_seq RESTART WITH 5;

INSERT INTO public.pno_type_rules (
     pno_type_id,                 species,                                                    fao_areas,                                    cgpm_areas,  gears, flag_states, minimum_quantity_kg) VALUES 
    (          1, '{HKE,BSS,COD,ANF,SOL}', '{27.3.a,27.4,27.6,27.7,27.8.a,27.8.b,27.8.c,27.8.d,27.9.a}',                                          '{}',   '{}',        '{}',                   0),
    (          1,                 '{HKE}',                                                       '{37}', '{30.01,30.05,30.06,30.07,30.09,30.10,30.11}',   '{}',        '{}',                   0),
    (          1,     '{HER,MAC,HOM,WHB}',                                           '{27,34.1.2,34.2}',                                          '{}',   '{}',        '{}',               10000),
    (          2, '{HKE,BSS,COD,ANF,SOL}', '{27.3.a,27.4,27.6,27.7,27.8.a,27.8.b,27.8.c,27.8.d,27.9.a}',                                          '{}',   '{}',        '{}',                2000),
    (          2,     '{HER,MAC,HOM,WHB}',                                           '{27,34.1.2,34.2}',                                          '{}',   '{}',        '{}',               10000),
    (          3,                    '{}',                                                         '{}',                                          '{}',   '{}', '{GBR,VEN}',                   0),
    (          4,                    '{}',                                                         '{}',                                          '{}', '{SB}',        '{}',                   0);
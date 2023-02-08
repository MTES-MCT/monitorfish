DELETE FROM public.analytics_missions_control_units;
DELETE FROM public.analytics_control_units;
DELETE FROM analytics_administrations;

INSERT INTO public.analytics_administrations
    (id,       name) VALUES
    ( 1, 'Sheriffs'),
    ( 2,  'Cowboys'),
    ( 3,  'Rangers');

INSERT INTO public.analytics_control_units
    (id, administration_id,                  name, archived) VALUES
    ( 1,                 1,           'Jacky Joe',    false),
    ( 2,                 1,    'No Shit Sherlock',    false),
    ( 3,                 1,           'Nozy Mary',    false),
    ( 4,                 2,      'Michael Junior',    false),
    ( 5,                 2,     'Mike The Buster',    false),
    ( 6,                 2,    'Bernie Fast Feet',    false),
    ( 7,                 3, 'Fisherman''s Friend',    false),
    ( 8,                 3,       'Bobby McDewis',    false);
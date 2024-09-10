INSERT INTO ports (
    country_code_iso2,              facade, region,  locode, port_name, latitude, longitude, fao_areas, is_active)
VALUES
    (            'AD',                null,   null, 'ADALV', 'Andorra la Vella', 42.5, 1.01666666666667,  ARRAY ['27.8'], true),
    (            'FR',        'Guadeloupe',   null, 'FRZEG', 'Auray', 47.666491, -2.983767, ARRAY ['27.7', '27.7.b'], true),
    (            'AE',        'Guadeloupe',   null, 'AEABU', 'Abu al Bukhoosh', 25.4833333333333, 53.05, null, true),
    (            'AE',        'Guadeloupe',   'AZ', 'AEAUH', 'Abu Dhabi', 24.4666666666667, 54.0666666666667, null, false),
    (            'AE',        'Guadeloupe',   null, 'AEAMU', 'Abu Musa', 25.8666666666667, 55.0833333333333, null, true),
    (            'AE',                null,   'AZ', 'AEARP', 'Ahmed Bin Rashid Port', 25.5333333333333, 55.0833333333333, null, true),
    (            'AE',              'NAMO',   null, 'AEAJM', 'Ajman', null, null, null, true),
    (            'AE',              'NAMO',   'FU', 'AEFJR', 'Al Fujayrah', 25.1166666666667, 56.1, null, true),
    (            'AE',              'NAMO',   'RK', 'AEJAZ', 'Al Jazeera Port', 25.7166666666667, 55.0833333333333, null, true),
    (            'AE',              'NAMO',   'RK', 'AEAJP', 'Al Jeer Port', 26.0333333333333, 56.1, null, true),
    (            'AE',              'NAMO',   null, 'AERUW', 'Ar Ruways', 24.1166666666667, 52.0333333333333, null, true),
    (            'AE',                null,   null, 'AEARZ', 'Arzanah Island', null, null, null, true),
    (            'AE',                null,   null, 'AEDAS', 'Das Island', null, null, null, false),
    (            'AE',                'SA',   'SH', 'AEDBP', 'Dibba', 25.6166666666667, 56.1, null, true),
    (            'AE',                'SA',   'DU', 'AEDXB', 'Dubai', 25.25, 55.0833333333333, null, true),
    (            'AE',                'SA',   'AZ', 'AEEND', 'Esnnad', 24.3166666666667, 54.0666666666667, null, false),
    (            'AE',                'SA',   null, 'AEFAT', 'Fateh Terminal', null, null, null, true),
    (            'AE',                'SA',   'DU', 'AEFRP', 'Free Port', 25.25, 55.0833333333333, null, true),
    (            'AE',                null,   'DU', 'AEHZP', 'Hamriya Free Zone Port', 25.3, 55.0833333333333, null, true),
    (            'AE',                null,   'DU', 'AEHSN', 'Hassyan', 24.9, 54.0666666666667, null, false),
    (            'AE',                null,   null, 'AEHTL', 'Hulaylah Terminal', 25.9833333333333, 55.0833333333333, null, true),

    -- https://service.unece.org/trade/locode/fr.htm
    (            'FR',              'NAMO',   '29', 'FRBES', 'Brest', 48.24, 4.29, null, true),
    (            'FR',              'MEMN',   '13', 'FRMRS', 'Marseille', 43.18, 5.24, null, true),
    (            'FR',              'MEMN',   '06', 'FRNCE', 'Nice', 43.42, 7.16, null, true),
    (            'FR',              'NAMO',   '35', 'FRSML', 'Saint-Malo', 48.39, 2.01, null, true),
    (            'FR',              'NAMO',   '56', 'FRVNE', 'Vannes', 47.39, 2.46, null, true),
    (            'RE',  'Sud Océan Indien',  '974', 'REZSE', 'Saint-Denis De La Réunion', -20.88, 55.45, ARRAY ['51.6', '51.7'], true),
    (            'AU',                null,   null, 'AUSYD', 'Sydney', -33.51, 151.12, null, true),
    (            'BR',                null,   null, 'BROIA', 'Oiapoque', 3.51, -51.49, null, true);

DELETE FROM public.legipeche;

INSERT INTO public.legipeche (
    extraction_datetime_utc, extraction_occurence,            page_title,                          page_url,         document_title,         document_url
) VALUES
    (      '2021-3-2 14:25',           'previous',       'Some old page', 'http://dead_link.regulation.url',    'Some old reg text',  'http://some.thing'),
    (      '2021-3-2 14:25',           'previous', 'Med. sea regulation',            'http://regulation.i2',         'Med reg text',     'http://med.reg'),
    (      '2021-3-2 14:25',           'previous', 'Bretagne regulation',                 'http://some.url',    'Bretagne reg text',     'http://bzh.reg'),
    (      '2021-3-2 14:25',           'previous',  'Bretagne other reg',           'http://some.other.url', 'Bretagne other reg 1', 'http://bzh.other_1'),
    (      '2021-3-2 14:25',           'previous',  'Bretagne other reg',           'http://some.other.url', 'Bretagne other reg 2', 'http://bzh.other_2'),
    (      '2021-3-3 14:25',             'latest',  'Bretagne other reg',           'http://some.other.url', 'Bretagne other reg 1', 'http://bzh.other_1'),
    (      '2021-3-3 14:25',             'latest',  'Bretagne other reg',           'http://some.other.url', 'Bretagne other reg 3', 'http://bzh.other_3'),
    (      '2021-3-3 14:25',             'latest', 'Bretagne regulation',                 'http://some.url',    'Bretagne reg text',     'http://bzh.reg'),
    (      '2021-3-2 14:25',           'previous',   'Unused regulation',               'http://unused.url',      'Unused reg text',  'http://unused.reg'),
    (      '2021-3-3 14:25',             'latest', 'Med. sea regulation',            'http://regulation.i2',         'Med reg text',     'http://med.reg'),
    (      '2021-3-3 14:25',             'latest',   'Unused regulation',               'http://unused.url',      'Unused reg text',  'http://unused.reg'),
    (      '2021-3-3 14:25',             'latest', 'Unused regulation 2',             'http://unused_2.url',      'Unused reg text', 'http://unused2.reg');
DELETE FROM public.legipeche;

INSERT INTO public.legipeche (
    extraction_datetime_utc, extraction_occurence,              page_title,                                                           page_url,            document_title,         document_url
) VALUES
    (      '2021-3-2 14:25',           'previous',         'Some old page',          'http://legipeche.metier.e2.rie.gouv.fr/deleted-regulation-a671.html',       'Some old reg text',  'http://some.thing'),
    (      '2021-3-2 14:25',           'previous',   'Med. sea regulation', 'http://legipeche.metier.e2.rie.gouv.fr/regulation-with-unstable-url-a689.html',            'Med reg text',     'http://med.reg'),
    (      '2021-3-2 14:25',           'previous',   'Bretagne regulation',             'http://legipeche.metier.e2.rie.gouv.fr/some-regulation-a666.html',       'Bretagne reg text',     'http://bzh.reg'),
    (      '2021-3-2 14:25',           'previous', 'Bretagne modified reg',         'http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html', 'Bretagne modified reg 1', 'http://bzh.other_1'),
    (      '2021-3-2 14:25',           'previous', 'Bretagne modified reg',         'http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html', 'Bretagne modified reg 2', 'http://bzh.other_2'),
    (      '2021-3-3 14:25',             'latest', 'Bretagne modified reg',         'http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html', 'Bretagne modified reg 1', 'http://bzh.other_1'),
    (      '2021-3-3 14:25',             'latest', 'Bretagne modified reg',         'http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html', 'Bretagne modified reg 3', 'http://bzh.other_3'),
    (      '2021-3-3 14:25',             'latest',   'Bretagne regulation',             'http://legipeche.metier.e2.rie.gouv.fr/some-regulation-a666.html',       'Bretagne reg text',     'http://bzh.reg'),
    (      '2021-3-2 14:25',           'previous',     'Unused regulation',           'http://legipeche.metier.e2.rie.gouv.fr/unused-regulation-a670.html',         'Unused reg text',  'http://unused.reg'),
    (      '2021-3-3 14:25',             'latest',   'Med. sea regulation', 'http://legipeche.metier.e2.rie.gouv.fr/regulation-with-unstable-url-a689.html',            'Med reg text',     'http://med.reg'),
    (      '2021-3-3 14:25',             'latest',     'Unused regulation',           'http://legipeche.metier.e2.rie.gouv.fr/unused-regulation-a670.html',         'Unused reg text',  'http://unused.reg'),
    (      '2021-3-3 14:25',             'latest',   'Unused regulation 2',     'http://legipeche.metier.e2.rie.gouv.fr/other-unused-regulation-a675.html',         'Unused reg text', 'http://unused2.reg');
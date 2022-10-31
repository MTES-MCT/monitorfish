DELETE FROM public.regulations;

INSERT INTO public.regulations (
    id,        law_type,                   topic,        zone,                                                                                                                  regulatory_references
) VALUES
    (1, 'Reg. Facade 1',   'Morbihan - bivalves', 'Secteur 1',                                                                                                                                 'null'),
    (2, 'Reg. Facade 1',   'Morbihan - bivalves', 'Secteur 2', '[{"url": "http://some.url", "reference": "some regulation"}, {"url": "http://some.other.url", "reference": "some other regulation"}]'),
    (3, 'Reg. Facade 2', 'Mediterranée - filets',    'Zone A',                                                                                                                                 'null'),
    (4, 'Reg. Facade 2', 'Mediterranée - filets',    'Zone B',                                                                    '[{"url": "http://regulation.url", "reference": "Med regulation"}]'),
    (5, 'Reg. Facade 2', 'Mediterranée - filets',    'Zone C',                                                    '[{"url": "http://dead_link.regulation.url", "reference": "Dead link regulation"}]');
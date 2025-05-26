DELETE FROM public.species;

INSERT INTO public.species (
        id, species_code,                    species_name, scip_species_type) VALUES
    (    1,        'GHL',              'Pou Hasse Caille',        'DEMERSAL'),
    (    2,        'BFT',           '(Capitaine) Haddock',            'TUNA'),
    (    3,        'BF1', '(Capitaine) Haddock calibre 1',            'TUNA'),
    (    4,        'SWO',          'Friture sur la ligne',              NULL);
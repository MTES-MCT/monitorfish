DELETE FROM public.foreign_fmcs;

INSERT INTO public.foreign_fmcs (
    country_code_iso3,       country_name,              email_addresses
) VALUES
(               'AAA',          'Alabama', '{fmc@aaa.com,fmc2@aaa.com}'),
(               'BBB', 'Boulgiboulgastan',                         '{}');
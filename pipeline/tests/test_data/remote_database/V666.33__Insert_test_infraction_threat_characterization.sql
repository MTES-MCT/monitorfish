DELETE FROM public.infraction_threat_characterization;
DELETE FROM public.threat_characterizations;
DELETE FROM public.threats;

INSERT INTO public.threats (
     id,            name) VALUES
    ( 1, 'Test Threat 1'),
    ( 2, 'Test Threat 2');

ALTER SEQUENCE threats_id_seq RESTART WITH 3;

INSERT INTO public.threat_characterizations (
     id,                      name, threat_id) VALUES
    ( 1, 'Test Characterization 1',         1),
    ( 2, 'Test Characterization 2',         2);

ALTER SEQUENCE threat_characterizations_id_seq RESTART WITH 3;

INSERT INTO public.infraction_threat_characterization (
     natinf_code, threat_characterization_id) VALUES
    (      22206,                          1),
    (      27724,                          2);

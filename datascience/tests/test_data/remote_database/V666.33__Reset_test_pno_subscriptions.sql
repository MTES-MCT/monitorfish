DELETE FROM public.pno_ports_subscriptions;
DELETE FROM public.pno_segments_subscriptions;
DELETE FROM public.pno_vessels_subscriptions;

INSERT INTO public.pno_ports_subscriptions (
        control_unit_id, port_locode, receive_all_pnos) VALUES
    (                 1,     'FRCQF',            false),
    (                 2,     'FRDKK',            false),
    (                 2,     'FRLEH',            false),
    (                 2,     'FRZJZ',            false),
    (                 3,     'FRZJZ',            false),
    (                 3,     'FRLEH',            false),
    (                 4,     'FRDPE',             true)
;


INSERT INTO public.pno_segments_subscriptions (
        control_unit_id,       segment) VALUES
    (                 1, 'SWW01/02/03'),
    (                 3, 'SWW01/02/03')
;


INSERT INTO public.pno_vessels_subscriptions (
        control_unit_id,            cfr) VALUES
    (                 4, '___TARGET___')
;
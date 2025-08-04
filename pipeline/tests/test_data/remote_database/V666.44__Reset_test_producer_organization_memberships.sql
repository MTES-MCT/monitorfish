DELETE FROM public.producer_organization_memberships;

INSERT INTO public.producer_organization_memberships (
    internal_reference_number, joining_date, organization_name
) VALUES
    (          'ABC000306959', '14/03/2015',       'SA THO AN'),
    (          'ABC000542519', '22/07/2016',       'OP DU SUD'),
    (          'ABC000055481', '09/10/2017',       'SA THO AN'),
    (          '___TARGET___', '23/05/2018',       'SA THO AN'),
    (          'ABC000658985', '23/05/2019',       'SA THO AN');

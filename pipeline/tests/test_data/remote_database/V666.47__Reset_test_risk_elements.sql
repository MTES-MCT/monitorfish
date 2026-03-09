DELETE FROM public.risk_elements;

INSERT INTO risk_elements (
    code, name, threat_characterization_id
) VALUES 
    ('PNO_MR', 'Prior notification misrecording', 7),
    ('MOT_MR', 'Exceeding the margin of tolerance', 6),
    ('VMS_MR', 'Unjustified VMS failure', 1),
    ('CLA_CM', 'Fishing in closed area', 2);
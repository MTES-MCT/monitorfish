DELETE FROM satellite_operators;

INSERT INTO satellite_operators (
    id, name, emails
) VALUES
(    1, 'SAT', '{email1@sat.op,email2@sat.op}'),
(    2, 'SRV', '{contact@src.gps}');

SELECT 
    facade_cnsp AS facade,
    email_address,
    ST_SubDivide(geometry) AS geometry
FROM prod.facade_areas
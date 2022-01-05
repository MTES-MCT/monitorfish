SELECT 
    facade,
    ST_SubDivide(geometry) AS geometry
FROM prod.facade_areas
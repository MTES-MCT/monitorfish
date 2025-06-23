WITH locode_counts AS (
    SELECT locode, COUNT(*) as count
    FROM COMMUN.C_CODE_PORT port
    WHERE locode IS NOT NULL
    AND LENGTH(locode) = 5
    GROUP BY locode),

valid_unique_locodes AS (
    SELECT locode 
    FROM locode_counts 
    WHERE count = 1
)

SELECT 
    pays.code_pays_iso2 AS country_code_iso2,
    dept.libelle as region,
    port.locode,
    INITCAP(port.libelle) as port_name,
    latitude,
    longitude
FROM COMMUN.C_CODE_PORT port
LEFT JOIN COMMUN.C_CODE_PAYS pays
ON pays.idc_pays = port.idc_pays
LEFT JOIN COMMUN.C_CODE_DEPARTEMENT dept
ON dept.idc_departement = port.idc_departement
WHERE locode IN (SELECT locode FROM valid_unique_locodes)
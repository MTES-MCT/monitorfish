WITH t1 AS (
    SELECT
        CAST(TRIM(BOTH ' ' FROM inf.code) AS INTEGER) as natinf_code,
        inf.texte_reglementaire as regulation,
        typinf.libelle as infraction_category,
        inf.libelle as infraction,
        ROW_NUMBER() OVER (PARTITION BY TRIM(BOTH ' ' FROM inf.code) ORDER BY inf.texte_reglementaire) AS row_num
    FROM FMC2.FMC_CODE_NATINF inf
    LEFT JOIN FMC2.FMC_CODE_TYPE_INFRACTION typinf
    ON inf.idc_fmc_type_infraction = typinf.idc_fmc_type_infraction
    WHERE REGEXP_LIKE(TRIM(BOTH ' ' FROM inf.code), '^[0-9]+$') -- exclude natinfs that are not castable to integers
)

SELECT
    natinf_code,
    regulation,
    infraction_category,
    infraction
FROM t1
WHERE row_num=1
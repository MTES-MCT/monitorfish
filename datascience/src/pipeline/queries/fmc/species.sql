SELECT 
    spe.idc_pch_espece as id,
    spe.code_fao as species_code,
    spe.libelle as species_name,
    spe_code_group.code as species_group_code,
    spe_code_group.libelle as species_group_name,
    spe.source
FROM COMMUNFMC.C_PCH_CODE_ESPECE spe
LEFT JOIN COMMUNFMC.C_PCH_GROUPE_ESPECE spe_group
ON spe.idc_pch_espece = spe_group.idc_pch_espece
LEFT JOIN COMMUNFMC.C_PCH_CODE_GROUPE_ESPECE spe_code_group
ON spe_group.idc_pch_groupe_espece = spe_code_group.idc_pch_groupe_espece
ORDER BY id
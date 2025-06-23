SELECT 
    c.id_fmc_bc_controle as id,
    spe.code_fao as species_code,
    capt.capture AS catch_weight,
    capt.nombre_pieces AS number_fish
FROM FMC2.FMC_BC_CONTROLE c
LEFT JOIN FMC2.FMC_BC_RESULTAT_CONTROLE rc
ON c.id_fmc_bc_resultat_controle = rc.id_fmc_bc_resultat_controle
JOIN FMC2.FMC_BC_RESULTAT_CONT_CAPT capt
ON capt.id_fmc_bc_resultat_controle = rc.id_fmc_bc_resultat_controle
LEFT JOIN COMMUNFMC.C_PCH_CODE_ESPECE spe
ON capt.idc_pch_espece = spe.idc_pch_espece
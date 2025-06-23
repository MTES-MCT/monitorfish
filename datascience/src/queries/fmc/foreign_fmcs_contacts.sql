SELECT 
    cp.code_pays_iso3 AS country_code_iso3, 
    cp.lib_francais AS country_name, 
    dest.adresse as email_address 
FROM FMC2.FMC_FMC_ETRANGER fmc 
LEFT JOIN COMMUNFMC.C_CODE_PAYS cp 
ON cp.idc_pays = fmc.idc_pays 
LEFT JOIN FMC2.FMC_MOYEN_COMM_DEST dest 
ON fmc.id_fmc_destinataire = dest.id_fmc_destinataire 
LEFT JOIN FMC2.FMC_CODE_MOYEN_COMM mc 
ON dest.idc_fmc_moyen_comm = mc.idc_fmc_moyen_comm 
WHERE 
    mc.libelle = 'Email' OR 
    mc.libelle IS NULL
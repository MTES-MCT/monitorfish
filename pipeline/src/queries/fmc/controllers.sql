SELECT
    mc.idc_fmc_moyen_controle as id,
    INITCAP(mc.libelle) as controller,
    tmc.libelle as controller_type,
    adm.libelle as administration
FROM FMC2.FMC_CODE_MOYEN_CONTROLE mc
LEFT JOIN FMC2.FMC_CODE_ADMINISTRATION adm
ON mc.idc_fmc_administration = adm.idc_fmc_administration
LEFT JOIN FMC2.FMC_CODE_TYPE_MOYEN tmc
ON tmc.idc_fmc_type_moyen = mc.idc_fmc_type_moyen
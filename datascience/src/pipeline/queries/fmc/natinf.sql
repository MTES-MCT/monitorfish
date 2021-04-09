SELECT
    inf.idc_fmc_natinf as id,
    inf.code as natinf_code,
    inf.texte_reglementaire as regulation,
    typinf.libelle as infraction_category,
    inf.libelle as infraction
FROM FMC2.FMC_CODE_NATINF inf
LEFT JOIN FMC2.FMC_CODE_TYPE_INFRACTION typinf
ON inf.idc_fmc_type_infraction = typinf.idc_fmc_type_infraction
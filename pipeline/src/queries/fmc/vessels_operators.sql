SELECT
    n.id_nav_flotteur AS id,
    a.nom AS operator_name_pos,
    a.email AS operator_email_pos,
    REPLACE(a.tel_fixe_1, ' ', '') AS operator_phone_1_pos,
    REPLACE(a.tel_fixe_2, ' ', '') AS operator_phone_2_pos,
    REPLACE(a.tel_fixe_3, ' ', '') AS operator_phone_3_pos,
    REPLACE(a.tel_mobile, ' ', '') AS operator_mobile_phone_pos,
    REPLACE(a.fax, ' ', '') AS operator_fax_pos,
    adresse_concatenee || ' ' || cp.lib_francais AS operator_address,
    a.id_adm_intervenant AS operator_id_adm_intervenant
FROM FMC2.FMC_NAVIRE n
LEFT JOIN FMC2.FMC_ARMATEUR a
ON a.id_fmc_armateur = n.id_fmc_armateur
LEFT JOIN COMMUNFMC.C_CODE_PAYS cp
ON cp.idc_pays = a.idc_pays
WHERE n.est_actif = 1
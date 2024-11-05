SELECT
    n.id_nav_flotteur AS id,
    a.nom AS operator_name_pos,
    a.email AS operator_email_pos,
    REPLACE(a.tel_fixe_1, ' ', '') AS operator_phone_1_pos,
    REPLACE(a.tel_fixe_2, ' ', '') AS operator_phone_2_pos,
    REPLACE(a.tel_fixe_3, ' ', '') AS operator_phone_3_pos,
    REPLACE(a.tel_mobile, ' ', '') AS operator_mobile_phone_pos,
    REPLACE(a.fax, ' ', '') AS operator_fax_pos
FROM FMC2.FMC_NAVIRE n
LEFT JOIN FMC2.FMC_ARMATEUR a
ON a.id_fmc_armateur = n.id_fmc_armateur
WHERE n.est_actif = 1
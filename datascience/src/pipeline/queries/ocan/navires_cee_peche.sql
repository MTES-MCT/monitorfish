SELECT
    ncp.id_nav_flotteur AS id_nav_flotteur_ncp,
    nom_port_etranger AS district_ncp,
    longueur_hors_tout AS length_ncp,
    jauge_ums AS gauge_ncp,
    puissance_propulsion AS power_ncp,
    nom_armateur AS operator_name_ncp,
    eng1.code AS fishing_gear_main_ncp,
    eng2.code AS fishing_gear_secondary_ncp,
    eng3.code AS fishing_gear_third_ncp,
    tn.libelle AS vessel_type_ncp,
    arm_email AS operator_email_ncp,
    prop_email AS proprietor_email_ncp
FROM NAVPRO.NAV_NAVIRE_CEE_PECHE ncp
LEFT JOIN COMMUN.C_PCH_CODE_ENGIN_CE eng1
ON ncp.idc_pch_engin_principal = eng1.idc_pch_engin_ce
LEFT JOIN  COMMUN.C_PCH_CODE_ENGIN_CE eng2
ON ncp.idc_pch_engin_secondaire = eng2.idc_pch_engin_ce
LEFT JOIN  COMMUN.C_PCH_CODE_ENGIN_CE eng3
ON ncp.idc_pch_engin_auxiliaire1 = eng3.idc_pch_engin_ce
LEFT JOIN COMMUN.C_PCH_CODE_TYPE_NAVIRE tn
ON ncp.idc_pch_type_navire = tn.idc_pch_type_navire
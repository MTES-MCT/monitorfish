SELECT
    nfp.id_nav_navire_francais,
    nfp.numero_cfr AS cfr_nfp,
    eng_1.code AS fishing_gear_main,
    eng_2.code AS fishing_gear_secondary,
    eng_3.code AS fishing_gear_third
FROM NAVPRO.NAV_FR_PECHE nfp
LEFT JOIN VENUS.F_CODE_ENGIN eng_1
ON nfp.idc_engin_principal = eng_1.idc_engin
LEFT JOIN VENUS.F_CODE_ENGIN eng_2
ON nfp.idc_engin_secondaire = eng_2.idc_engin 
LEFT JOIN VENUS.F_CODE_ENGIN eng_3
ON nfp.idc_autre_engin_1 = eng_3.idc_engin
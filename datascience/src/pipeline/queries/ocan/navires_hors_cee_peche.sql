SELECT
    id_nav_flotteur AS id_nav_flotteur_nep,
    eng.code as fishing_gear_main_nep
FROM NAVPRO.NAV_ETR_PECHE nep
LEFT JOIN COMMUN.C_PCH_CODE_ENGIN_CE eng
ON nep.idc_pch_engin_prin = eng.idc_pch_engin_ce
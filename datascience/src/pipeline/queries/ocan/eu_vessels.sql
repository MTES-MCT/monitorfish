SELECT
	f.id_nav_flotteur AS id,
	f.num_imo AS imo,
	f.num_cfr AS cfr,
    ncp.marquage_exterieur AS external_immatriculation,
	f.nom_navire AS vessel_name,
	f.indicatif_radio AS ircs,
	f.numero_mmsi AS mmsi,
	cp.code_pays_iso2 AS flag_state,
    INITCAP(ncp.nom_port_etranger) AS district,
    ncp.longueur_hors_tout AS length,
    ncp.jauge_ums AS gauge,
    puissance_propulsion AS power,
    tn.libelle AS vessel_type,
    INITCAP(nom_armateur) AS operator_name,
    LOWER(arm_email) AS operator_email,
    LOWER(prop_email) AS proprietor_email,
    eng1.code AS fishing_gear_main,
    eng2.code AS fishing_gear_secondary,
    eng3.code AS fishing_gear_third
FROM NAVPRO.NAV_FLOTTEUR f
LEFT JOIN NAVPRO.NAV_NAVIRE_CEE_PECHE ncp
ON f.id_nav_flotteur = ncp.id_nav_flotteur
LEFT JOIN COMMUN.C_CODE_PAYS cp
ON f.idc_pays_flotteur = cp.idc_pays
LEFT JOIN COMMUN.C_PCH_CODE_ENGIN_CE eng1
ON ncp.idc_pch_engin_principal = eng1.idc_pch_engin_ce
LEFT JOIN  COMMUN.C_PCH_CODE_ENGIN_CE eng2
ON ncp.idc_pch_engin_secondaire = eng2.idc_pch_engin_ce
LEFT JOIN  COMMUN.C_PCH_CODE_ENGIN_CE eng3
ON ncp.idc_pch_engin_auxiliaire1 = eng3.idc_pch_engin_ce
LEFT JOIN COMMUN.C_PCH_CODE_TYPE_NAVIRE tn
ON ncp.idc_pch_type_navire = tn.idc_pch_type_navire
WHERE ncp.est_actif = 1 AND
    f.idc_situation IN (2, 4, 5, 7, 9, 10) AND
    f.idc_statut_flotteur != 3 AND
    (
        f.indicatif_radio IS NOT NULL OR
        f.num_cfr IS NOT NULL OR
        ncp.marquage_exterieur IS NOT NULL
    ) AND
    -- All EU states, minus France, plus Great Britain
    -- whose vessels are still available in this table although they are no longer
    -- in Fleet Register since 2021, January 1st
    cp.code_pays_iso2 IN (
        'BE', 'BG', 'CY', 'DE', 'DK', 'EE', 'ES', 'FI', 'GB', 'GR', 'HR', 'IE', 'IT', 'LT',
        'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'AT', 'HU', 'LU', 'CZ', 'SK'
    )
SELECT
	f.id_nav_flotteur AS id,
	f.num_imo AS imo,
	f.num_cfr AS cfr,
    nep.marquage_exterieur AS external_immatriculation,
	f.nom_navire AS vessel_name,
	f.indicatif_radio AS ircs,
	f.numero_mmsi AS mmsi,
	COALESCE(
        CASE
            WHEN cp.code_pays_iso2 = 'X' THEN 'UNDEFINED'
            ELSE cp.code_pays_iso2
        END,
        'UNDEFINED'
    ) AS flag_state,
	ne.longueur_hors_tout AS length,
    nep.jauge_ums AS gauge,
    nep.puissance_propulsion AS power,
	ne.tel_fixe_1_contact_navire AS vessel_phone_1,
	ne.tel_fixe_2_contact_navire AS vessel_phone_2,
	ne.tel_fixe_3_contact_navire AS vessel_phone_3,
	ne.tel_mobile_contact_navire AS vessel_mobile_phone,
    ne.fax_contact_navire AS vessel_fax,
    ne.telex_contact_navire AS vessel_telex,
	LOWER(ne.courriel_1_contact_navire) AS vessel_email_1,
	LOWER(ne.courriel_2_contact_navire) AS vessel_email_2,
    INITCAP(ne.nom_raison_sociale_armateur) AS operator_name,
    LOWER(ne.courriel_1_armateur) AS operator_email_1,
    LOWER(ne.courriel_2_armateur) AS operator_email_2,
    ne.tel_fixe_1_armateur AS operator_phone_1,
    ne.tel_fixe_2_armateur AS operator_phone_2,
    ne.tel_mobile_armateur AS operator_mobile_phone,
    ne.fax_armateur AS operator_fax,
    INITCAP(ne.nom_proprietaire) AS proprietor_name,
    eng_1.code as fishing_gear_main,
    eng_2.code as fishing_gear_secondary
FROM NAVPRO.NAV_FLOTTEUR f
LEFT JOIN COMMUN.C_CODE_PAYS cp
ON f.idc_pays_flotteur = cp.idc_pays
LEFT JOIN NAVPRO.NAV_NAVIRE_ETRANGER ne
ON ne.id_nav_flotteur = f.id_nav_flotteur
LEFT JOIN NAVPRO.NAV_ETR_PECHE nep
ON nep.id_nav_flotteur = f.id_nav_flotteur
LEFT JOIN COMMUN.C_PCH_CODE_ENGIN_CE eng_1
ON nep.idc_pch_engin_prin = eng_1.idc_pch_engin_ce
LEFT JOIN COMMUN.C_PCH_CODE_ENGIN_CE eng_2
ON nep.idc_pch_engin_sec = eng_2.idc_pch_engin_ce
WHERE
    f.idc_situation IN (2, 4, 5, 7, 9, 10) AND
    f.idc_statut_flotteur != 3 AND
    (
        f.indicatif_radio IS NOT NULL OR
        f.num_cfr IS NOT NULL OR
        nep.marquage_exterieur IS NOT NULL
    ) AND
    -- All except EU states and Great Britain
    cp.code_pays_iso2 NOT IN (
        'BE', 'BG', 'CY', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'IE', 'IT',
        'LT', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'AT', 'HU', 'LU', 'CZ', 'SK'
    )

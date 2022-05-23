SELECT
	ne.id_nav_flotteur AS id_nav_flotteur_ne,
	ne.longueur_hors_tout AS length_ne,
	ne.tel_fixe_1_contact_navire AS vessel_phone_1_ne,
	ne.tel_fixe_2_contact_navire AS vessel_phone_2_ne,
	ne.tel_fixe_3_contact_navire AS vessel_phone_3_ne,
	ne.tel_mobile_contact_navire AS vessel_mobile_phone_ne,
	LOWER(ne.courriel_1_contact_navire) AS vessel_email_1_ne,
	LOWER(ne.courriel_2_contact_navire) AS vessel_email_2_ne,
    ne.fax_contact_navire AS vessel_fax_ne,
    ne.telex_contact_navire AS vessel_telex_ne,
    INITCAP(ne.nom_raison_sociale_armateur) AS operator_name_ne,
    ne.tel_fixe_1_armateur AS operator_phone_1_ne,
    ne.tel_fixe_2_armateur AS operator_phone_2_ne,
    ne.tel_mobile_armateur AS operator_mobile_phone_ne,
    LOWER(ne.courriel_1_armateur) AS operator_email_1_ne,
    LOWER(ne.courriel_2_armateur) AS operator_email_2_ne,
    ne.fax_armateur AS operator_fax_ne,
    INITCAP(ne.nom_proprietaire) AS proprietor_name_ne
FROM NAVPRO.NAV_NAVIRE_ETRANGER ne
LEFT JOIN COMMUN.C_CODE_PAYS cp
ON ne.idc_pays_pavillon = cp.idc_pays
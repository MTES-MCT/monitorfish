SELECT
	f.id_nav_flotteur AS id_nav_flotteur_f,
	f.num_imo AS imo_f,
	f.num_cfr AS cfr_f,
	f.num_immat_etranger AS external_immatriculation_f,
	f.nom_navire AS vessel_name_f,
	f.indicatif_radio AS ircs_f,
	f.numero_mmsi AS mmsi_f,
	cp.code_pays_iso2 AS flag_state_f,
	cq.code AS district_code_f,
	cq.libelle AS district_f,
	csf.libelle AS statut_flotteur_f,
	cs.libelle AS situation_flotteur_f
FROM NAVPRO.NAV_FLOTTEUR f
LEFT JOIN COMMUN.C_CODE_PAYS cp
ON f.idc_pays_flotteur = cp.idc_pays
LEFT JOIN COMMUN.C_CODE_QUARTIER cq
ON f.idc_quartier_immat = cq.idc_quartier
LEFT JOIN NAVPRO.NAV_CODE_STATUT_FLOTTEUR csf
ON f.idc_statut_flotteur = csf.idc_statut_flotteur
LEFT JOIN NAVPRO.NAV_CODE_SITUATION cs
ON f.idc_situation = cs.idc_situation
WITH pa AS (
    SELECT
        filtered_pa.id_nav_flotteur,
        filtered_pa.id_adm_intervenant,
        LISTAGG(cpagn.libelle_court, ', ') WITHIN GROUP(ORDER BY cpagn.libelle_court) AS sailing_type
    FROM NAVPRO.NAV_PA filtered_pa
    JOIN NAVPRO.NAV_PA_GN pagn
    ON pagn.id_nav_pa = filtered_pa.id_nav_pa
    JOIN COMMUN.C_CODE_GENRE_NAVIGATION cpagn
    ON pagn.idc_genre_navigation = cpagn.idc_genre_navigation
    WHERE
        filtered_pa.est_dernier = 1 AND
        filtered_pa.idc_nav_categ_armement = 1 AND -- catégorie armement 'PECHE - CULTURES MARINES'
        filtered_pa.idc_nav_statut_pa IN (1, 2) -- Status 'En cours' et 'Valide'

    GROUP BY filtered_pa.id_nav_flotteur, filtered_pa.id_adm_intervenant
),

e AS (
    SELECT
        id_adm_entreprise AS id_adm,
        raison_sociale AS name,
        email,
        telephone AS phone,
        tel_mobile AS mobile_phone,
        fax
    FROM ADM.ADM_ENTREPRISE
), 

a AS (
    SELECT
        id_adm_administre AS id_adm,
        nom || DECODE(prenom, NULL, '', ' ') || prenom as name,
        email, 
        telephone AS phone, 
        tel_mobile AS mobile_phone,
        fax
    FROM ADM.ADM_ADMINISTRE
),

adm AS (
    SELECT * FROM e
    UNION ALL
    SELECT * FROM a
),

nfp AS (
    SELECT
        nfp.id_nav_navire_francais AS id_nav_navire_francais,
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
)

SELECT
	f.id_nav_flotteur AS id,
	f.num_imo AS imo,
	f.num_cfr AS cfr,
	cqnf.code || nf.num_immat_francais AS external_immatriculation,
	f.nom_navire AS vessel_name,
	f.indicatif_radio AS ircs,
	f.numero_mmsi AS mmsi,
	cp.code_pays_iso2 AS flag_state,
	cqnf.code AS district_code,
	INITCAP(cqnf.libelle) AS district,
	nf.longueur_hors_tout AS length,
	nf.largeur AS width,
	nf.jauge_londres AS gauge,
	nf.puissance_propulsive AS power,
	nf.num_telephone AS vessel_phone_1,
	nf.tel_fixe_2_contact_navire AS vessel_phone_2,
	nf.tel_fixe_3_contact_navire AS vessel_phone_3,
	nf.tel_mobile_contact_navire AS vessel_mobile_phone,
    nf.fax AS vessel_fax,
    nf.telex AS vessel_telex,
	LOWER(nf.email1) AS vessel_email_1,
	LOWER(nf.email2) AS vessel_email_2,
	ctn.libelle_minus AS vessel_type,
	INITCAP(cpt.libelle) AS registry_port,
	pa.sailing_type as sailing_type,
    INITCAP(adm_operator.name) AS operator_name,
    LOWER(adm_operator.email) AS operator_email,
    adm_operator.phone AS operator_phone,
    adm_operator.mobile_phone AS operator_mobile_phone,
    adm_operator.fax AS operator_fax,
    INITCAP(adm_proprietor.name) AS proprietor_name,
    LOWER(adm_proprietor.email) AS proprietor_email,
    adm_proprietor.phone AS proprietor_phone,
    adm_proprietor.mobile_phone AS proprietor_mobile_phone,
    nfp.fishing_gear_main AS fishing_gear_main,
    nfp.fishing_gear_secondary AS fishing_gear_secondary,
    nfp.fishing_gear_third AS fishing_gear_third
FROM NAVPRO.NAV_FLOTTEUR f
LEFT JOIN COMMUN.C_CODE_PAYS cp
ON f.idc_pays_flotteur = cp.idc_pays
JOIN NAVPRO.NAV_NAVIRE_FRANCAIS nf
ON f.id_nav_flotteur = nf.id_nav_flotteur
LEFT JOIN NAVPRO.NAV_CODE_TYPE_NAVIRE ctn
ON nf.idc_type_navire = ctn.idc_type_navire
LEFT JOIN COMMUN.C_CODE_PORT cpt
ON cpt.idc_port = nf.idc_port_exploitation
LEFT JOIN COMMUN.C_CODE_QUARTIER cqnf
ON cqnf.idc_quartier = nf.idc_quartier
LEFT JOIN pa
ON pa.id_nav_flotteur = nf.id_nav_flotteur AND nf.id_adm_interv_exploitant = pa.id_adm_intervenant
LEFT JOIN adm adm_operator
ON adm_operator.id_adm = nf.id_adm_interv_exploitant
LEFT JOIN adm adm_proprietor
ON adm_proprietor.id_adm = nf.id_adm_interv_proprietaire
LEFT JOIN nfp
ON nfp.id_nav_navire_francais = nf.id_nav_navire_francais
WHERE
    -- Situations flotteur 'Français pêche', 'Pêche Communautaire', 'Pêche Non Communautaire',
    -- 'Navire Provisoire', 'Situation inconnue' et 'Fluvial Simba'
    f.idc_situation IN (2, 4, 5, 7, 9, 10) AND
    -- Exclusion du statut flotteur 'Hors service'
    f.idc_statut_flotteur != 3 AND
    (
        f.indicatif_radio IS NOT NULL OR
        f.num_cfr IS NOT NULL OR
        f.num_immat_francais IS NOT NULL
    ) AND
    cp.code_pays_iso2 = 'FR' AND
    nf.est_dernier = 1
WITH infractions AS (
    SELECT
        i.id_fmc_bc_resultat_controle,
        LISTAGG(n.code, ', ') WITHIN GROUP (ORDER BY n.code) infraction_natinfs
    FROM FMC2.FMC_BC_RESULTAT_CONT_INFR i
    JOIN FMC2.FMC_CODE_NATINF n
    ON i.idc_fmc_natinf = n.idc_fmc_natinf
    WHERE REGEXP_LIKE(TRIM(BOTH ' ' FROM n.code), '^[0-9]+$') -- exclude natinfs that are not castable to integers
    GROUP BY i.id_fmc_bc_resultat_controle
)

SELECT 
    c.id_fmc_bc_controle as id,
    c.id_nav_flotteur as vessel_id,
    f.num_cfr AS cfr,
    f.indicatif_radio AS ircs,
    c.marquage_exterieur AS external_immatriculation,
    c.nom_navire AS vessel_name,
    cp.code_pays_iso2 AS flag_state,
    cq.code AS district_code,
    c.idc_fmc_moyen_controle as control_unit_id,
    ctype.libelle as control_type,
    c.date_controle as action_datetime_utc,
    c.longitude as longitude,
    c.latitude as latitude,
    port.locode as port_locode,
    c.ordre_mission as mission_order,
    c.navire_cible as vessel_targeted,
    infractions.infraction_natinfs,
    CAST(COALESCE(rc.infraction, '0') AS INTEGER) AS infraction,
    rc.deroutement as diversion,
    rc.apprehension as seizure,
    rc.precision_apprehension as seizure_and_diversion_comments,
    rc.observations as other_comments,
    gears1.code as gear_1_code,
    gears2.code as gear_2_code,
    gears3.code as gear_3_code,
    rc.engin_controle1 as gear_1_was_controlled,
    rc.engin_controle2 as gear_2_was_controlled,
    rc.engin_controle3 as gear_3_was_controlled,
    rc.maillage1 as declared_mesh_1,
    rc.maillage2 as declared_mesh_2,
    rc.maillage3 as declared_mesh_3,
    rc.maillage_controle1 as controlled_mesh_1,
    rc.maillage_controle2 as controlled_mesh_2,
    rc.maillage_controle3 as controlled_mesh_3,
    c.trigramme_utilisateur AS open_by,
    rc.trigramme_utilisateur AS closed_by
FROM FMC2.FMC_BC_CONTROLE c
LEFT JOIN NAVPROFMC.NAV_FLOTTEUR f
ON c.id_nav_flotteur = f.id_nav_flotteur
LEFT JOIN COMMUNFMC.C_CODE_PAYS cp
ON c.idc_pays = cp.idc_pays
LEFT JOIN COMMUNFMC.C_CODE_QUARTIER cq
ON c.idc_quartier = cq.idc_quartier
LEFT JOIN FMC2.FMC_CODE_TYPE_CONTROLE ctype
ON c.idc_fmc_type_controle = ctype.idc_fmc_type_controle
LEFT JOIN FMC2.FMC_BC_RESULTAT_CONTROLE rc
ON c.id_fmc_bc_resultat_controle = rc.id_fmc_bc_resultat_controle
LEFT JOIN COMMUNFMC.C_CODE_PORT port
ON port.idc_port = c.idc_port
LEFT JOIN infractions
ON infractions.id_fmc_bc_resultat_controle = c.id_fmc_bc_resultat_controle
LEFT JOIN COMMUNFMC.C_PCH_CODE_ENGIN_CE gears1
ON gears1.idc_pch_engin_ce = rc.idc_pch_engin_ce1
LEFT JOIN COMMUNFMC.C_PCH_CODE_ENGIN_CE gears2
ON gears2.idc_pch_engin_ce = rc.idc_pch_engin_ce2
LEFT JOIN COMMUNFMC.C_PCH_CODE_ENGIN_CE gears3
ON gears3.idc_pch_engin_ce = rc.idc_pch_engin_ce3
WHERE 
    c.date_controle > ADD_MONTHS(SYS_EXTRACT_UTC(SYSTIMESTAMP), -:number_of_months) AND
    c.date_controle >= DATE '2013-01-01' AND
    -- Remove controls in the future!
    c.date_controle < ADD_MONTHS(SYS_EXTRACT_UTC(SYSTIMESTAMP), 1) 
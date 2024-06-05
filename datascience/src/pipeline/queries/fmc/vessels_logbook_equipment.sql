SELECT
    n.id_fmc_navire AS id,
    ceq.libelle AS logbook_equipment_status,
    eq.equipe_esacapt AS has_esacapt
FROM fmc2.fmc_navire n
LEFT JOIN fmc2.fmc_code_statut_equipemen ceq
ON ceq.idc_fmc_statut_equipemen = n.idc_fmc_statut_equipemen
LEFT JOIN fmc2.fmc_equipement_ers eq
ON eq.id_fmc_navire = n.id_fmc_navire AND eq.est_courant = 1
WHERE n.est_actif = 1
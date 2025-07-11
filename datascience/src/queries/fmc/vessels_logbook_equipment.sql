WITH e_sacapt_equipment_statuses AS (
    SELECT
        id_fmc_navire,
        equipe_esacapt,
        ROW_NUMBER() OVER (PARTITION BY id_fmc_navire ORDER BY DATE_PASSAGE_OFFICIEL DESC) AS rk
    FROM fmc2.fmc_equipement_ers
    WHERE est_courant = 1
),

latest_esacapt_status AS (
    SELECT
        id_fmc_navire,
        equipe_esacapt
    FROM e_sacapt_equipment_statuses
    WHERE rk = 1
)

SELECT
    n.id_nav_flotteur AS id,
    ceq.libelle AS logbook_equipment_status,
    eq.equipe_esacapt AS has_esacapt
FROM fmc2.fmc_navire n
LEFT JOIN fmc2.fmc_code_statut_equipemen ceq
ON ceq.idc_fmc_statut_equipemen = n.idc_fmc_statut_equipemen
LEFT JOIN latest_esacapt_status eq
ON eq.id_fmc_navire = n.id_fmc_navire
WHERE n.est_actif = 1
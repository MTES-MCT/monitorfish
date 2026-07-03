SELECT
    id_adm_administre AS operator_id_adm_intervenant,
    nat.LIBELLE AS operator_nationality
FROM ADM.ADM_ADMINISTRE adm
LEFT JOIN COMMUN.C_CODE_NATIONALITE nat
ON nat.IDC_NATIONALITE = adm.IDC_NATIONALITE
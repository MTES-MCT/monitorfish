SELECT
    n.id_nav_flotteur as vessel_id,
    b.numero as beacon_number,
    cst.libelle AS beacon_status,
    b.id_fmc_operateur_satellite AS satellite_operator_id,
    bn.date_debut AS logging_datetime_utc,
    ctb.libelle AS beacon_type,
    ctb.est_cotier AS is_coastal
FROM FMC2.FMC_BALISE b
LEFT JOIN FMC2.FMC_BALISE_NAVIRE bn
ON b.id_fmc_balise = bn.id_fmc_balise
LEFT JOIN FMC2.FMC_NAVIRE n
ON n.id_fmc_navire = bn.id_fmc_navire
LEFT JOIN FMC2.FMC_BALISE_STATUT st
ON st.id_fmc_balise_statut = bn.id_fmc_balise_statut
LEFT JOIN FMC2.FMC_CODE_STATUT_BALISE cst
ON cst.idc_fmc_statut_balise = st.idc_fmc_statut_balise
LEFT JOIN FMC2.FMC_CODE_TYPE_BALISE ctb
ON ctb.idc_fmc_type_balise = b.idc_fmc_type_balise
WHERE bn.est_courant = 1

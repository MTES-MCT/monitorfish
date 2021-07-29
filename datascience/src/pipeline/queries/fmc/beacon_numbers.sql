SELECT
    n.id_nav_flotteur as id_nav_flotteur_bn,
    b.numero as beacon_number
FROM FMC2.FMC_BALISE b
LEFT JOIN FMC2.FMC_BALISE_NAVIRE bn
ON b.id_fmc_balise = bn.id_fmc_balise
LEFT JOIN FMC2.FMC_NAVIRE n
ON n.id_fmc_navire = bn.id_fmc_navire
WHERE bn.est_courant = 1
AND n.id_nav_flotteur IS NOT NULL
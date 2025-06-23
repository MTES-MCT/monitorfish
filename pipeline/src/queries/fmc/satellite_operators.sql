SELECT
    os.id_fmc_operateur_satellite AS id,
    os.nom AS name,
    LISTAGG(mcd.adresse, ', ') WITHIN GROUP (ORDER BY mcd.adresse) emails
FROM FMC2.FMC_OPERATEUR_SATELLITE os
LEFT JOIN FMC2.FMC_MOYEN_COMM_DEST mcd
ON mcd.id_fmc_destinataire = os.id_fmc_destinataire
LEFT JOIN FMC2.FMC_CODE_MOYEN_COMM cmc
ON
    cmc.idc_fmc_moyen_comm = mcd.idc_fmc_moyen_comm AND
    cmc.libelle = 'Email'
GROUP BY
    os.id_fmc_operateur_satellite,
    os.nom
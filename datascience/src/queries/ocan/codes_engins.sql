SELECT 
    ce.code AS fishing_gear_code,
    ce.libelle AS fishing_gear,
    cce.libelle AS fishing_gear_category
FROM COMMUN.C_PCH_CODE_ENGIN_CE ce
LEFT JOIN COMMUN.C_PCH_CODE_CATEG_ENGIN_CE cce
ON ce.IDC_PCH_CATEG_ENGIN_CE = cce.IDC_PCH_CATEG_ENGIN_CE
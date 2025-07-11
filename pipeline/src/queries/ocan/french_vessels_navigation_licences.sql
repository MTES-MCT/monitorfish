WITH ord_cert AS (
    SELECT 
        f.id_nav_flotteur AS id,
        n.num_immat,
        etat.libelle AS etat_certificat,
        date_expiration,
        date_prorogation,
        c.num_version,
        ROW_NUMBER() OVER (PARTITION BY f.id_nav_flotteur
                           ORDER BY date_delivrance DESC, date_expiration DESC NULLS FIRST) AS rk
    FROM NAVPRO.NAV_FLOTTEUR f
    JOIN GINA.GIN_NAVIRE n
    ON
        f.num_immat_francais = n.num_immat AND
        f.id_nav_flotteur = n.id_nav_flotteur
    JOIN GINA.GIN_CERTIFICAT c
    ON
        c.num_immat = n.num_immat AND
        c.num_version = n.num_version
    JOIN GINA.GIN_CODE_CERTIFICAT cod
    ON c.idc_gin_certificat = cod.idc_gin_certificat
    JOIN GINA.GIN_CODE_ETAT_CERTIFICAT etat
    ON c.idc_gin_etat_certificat = etat.idc_gin_etat_certificat
    WHERE
        cod.libelle LIKE 'Permis de navigation%'
        AND date_suppression IS NULL
),

cert AS (
    SELECT
        id,
        num_immat,
        etat_certificat,
        date_expiration,
        date_prorogation,
        num_version
    FROM ord_cert
    WHERE rk = 1
)


SELECT
    cert.id,
    cert.etat_certificat AS nav_licence_status,
    cert.date_expiration AS nav_licence_expiration_date,
    cert.date_prorogation AS nav_licence_extension_date,
    LISTAGG(c_catnav.libelle, ', ') WITHIN GROUP(ORDER BY c_catnav.libelle) AS sailing_category
FROM cert
LEFT JOIN GINA.GIN_NAVIRE_CATEG_NAVIG catnav
ON 
    catnav.num_immat = cert.num_immat AND
    catnav.num_version = cert.num_version
LEFT JOIN GINA.GIN_CODE_CATEG_NAVIGATION c_catnav
ON c_catnav.idc_gin_categ_navigation = catnav.idc_gin_categ_navigation
GROUP BY
    cert.id,
    cert.date_expiration,
    cert.etat_certificat,
    cert.date_prorogation
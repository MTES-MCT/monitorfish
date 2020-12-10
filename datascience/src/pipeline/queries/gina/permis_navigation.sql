WITH ord_cert AS (
    SELECT 
        num_immat,
        date_expiration,
        num_version,
        ROW_NUMBER() OVER (PARTITION BY num_immat
                           ORDER BY date_expiration DESC) AS rk
    FROM GINA.GIN_CERTIFICAT
    WHERE idc_gin_certificat IN (47, 67, 68, 69)
),

cert AS (
    SELECT 
        num_immat,
        date_expiration,
        num_version
    FROM ord_cert
    WHERE rk = 1
),

licences_by_num_immat AS (
    SELECT 
        cert.num_immat,
        cert.date_expiration,
        LISTAGG(c_catnav.libelle, ', ') WITHIN GROUP(ORDER BY c_catnav.libelle) AS sailing_category
    FROM cert
    LEFT JOIN GINA.GIN_NAVIRE_CATEG_NAVIG catnav
    ON 
        catnav.num_immat = cert.num_immat AND
        catnav.num_version = cert.num_version
    LEFT JOIN GINA.GIN_CODE_CATEG_NAVIGATION c_catnav
    ON c_catnav.idc_gin_categ_navigation = catnav.idc_gin_categ_navigation
    GROUP BY cert.num_immat, cert.date_expiration
    ),
    
licences_by_floater AS (
    SELECT
        n.id_nav_flotteur AS id_nav_flotteur_gin,
        licences_by_num_immat.num_immat,
        licences_by_num_immat.date_expiration AS nav_licence_expiration_date,
        licences_by_num_immat.sailing_category,
        ROW_NUMBER() OVER (PARTITION BY n.id_nav_flotteur
                           ORDER BY date_expiration DESC) as rk
    FROM licences_by_num_immat
    LEFT JOIN GINA.GIN_NAVIRE n
    ON licences_by_num_immat.num_immat = n.num_immat
)

SELECT 
    id_nav_flotteur_gin,
    nav_licence_expiration_date,
    sailing_category
FROM licences_by_floater
WHERE rk = 1
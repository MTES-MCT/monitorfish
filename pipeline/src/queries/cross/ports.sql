SELECT
    country_code_iso2,
    locode,
    port_name,
    ST_Y(geometry) AS latitude,
    ST_X(geometry) AS longitude,
    geometry,
    COALESCE(is_active, false) AS is_active
FROM prod.ports
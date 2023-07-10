SELECT DISTINCT
    country_code_iso2,
    locode,
    port_name,
    ST_SetSRID(
        ST_Point(
            COALESCE(geocoded_longitude, longitude),
            COALESCE(geocoded_latitude, latitude)
        ),
        4326
    ) AS geometry,
    is_active
FROM interim.geocoded_ports_google
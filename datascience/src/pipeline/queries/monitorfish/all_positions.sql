SELECT 
    id,
    internal_reference_number AS cfr, 
    external_reference_number AS external_immatriculation, 
    ircs,
    date_time AS datetime_utc, 
    latitude, 
    longitude 
FROM positions 
WHERE date_time > :start 
AND date_time < :end 
ORDER BY date_time;
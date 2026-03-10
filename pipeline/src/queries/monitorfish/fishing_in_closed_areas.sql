SELECT 
    internal_reference_number AS cfr,
    COUNT(*) AS nb_reportings
FROM reportings
WHERE value->>'name' IN (
        'Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur',
        'Pêche en zone RTC par un navire français',
        'Chalutage dans les 3 milles',
        'Pêche en zone RTC par un navire étranger',
        'Chalutage de fond à plus de 800m de profondeur'
    )
    AND NOT deleted
    AND validation_date >= :from_datetime_utc
    AND internal_reference_number IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC

DELETE FROM public.infractions
WHERE NOT TRIM(BOTH ' ' FROM natinf_code) ~ '^[0-9]+$';

WITH infractions_with_row_number AS (
    SELECT
        natinf_code,
        row_number() OVER (PARTITION BY TRIM(BOTH ' ' FROM natinf_code) ORDER BY regulation) as row_num
    FROM infractions
),

infraction_natinf_codes_to_keep AS (
    SELECT natinf_code
    FROM infractions_with_row_number
    WHERE row_num = 1
)

DELETE FROM infractions
WHERE natinf_code NOT IN (SELECT natinf_code FROM infraction_natinf_codes_to_keep);

UPDATE public.infractions
SET natinf_code = TRIM(BOTH ' ' FROM natinf_code);

ALTER TABLE infractions
ALTER COLUMN natinf_code TYPE INTEGER
USING natinf_code::INTEGER;

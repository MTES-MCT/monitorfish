WITH infractions_with_row_number AS (
    SELECT
        id,
        natinf_code,
        row_number() OVER (PARTITION BY natinf_code ORDER BY regulation) as row_num
    FROM infractions
),

infraction_ids_to_keep AS (
    SELECT id
    FROM infractions_with_row_number
    WHERE row_num = 1
)

DELETE FROM infractions
WHERE id NOT IN (SELECT id FROM infraction_ids_to_keep);

ALTER TABLE public.infractions DROP COLUMN id;
ALTER TABLE public.infractions ADD PRIMARY KEY (natinf_code);

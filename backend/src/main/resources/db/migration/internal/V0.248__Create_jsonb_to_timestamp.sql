CREATE OR REPLACE FUNCTION jsonb_to_timestamp(json_data jsonb, key text)
RETURNS timestamp AS $$
    BEGIN
        RETURN (SELECT TO_TIMESTAMP(json_data ->> key, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
    END;
$$ LANGUAGE plpgsql IMMUTABLE;


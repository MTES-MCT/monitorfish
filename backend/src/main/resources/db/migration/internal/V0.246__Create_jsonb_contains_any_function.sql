CREATE OR REPLACE FUNCTION jsonb_contains_any(
    jsonb_data jsonb,
    collection_path text[],
    collection_key text,
    search_values text[]
)
RETURNS boolean AS $$
    DECLARE
        collection_value jsonb;
        key_path text;
        search_value text;
    BEGIN
        -- If the JSONB data is NULL, then the search is impossible
        IF jsonb_data IS NULL THEN
            RETURN FALSE;
        END IF;

        collection_value := jsonb_data;
        FOREACH key_path IN ARRAY collection_path
        LOOP
            collection_value := collection_value -> key_path;

            -- If any of the nested key value is NULL before reaching the collection, then the search is impossible
            IF collection_value IS NULL THEN
                RETURN FALSE;
            END IF;
        END LOOP;

        -- If the collection value is not an array, then the search is impossible
        IF jsonb_typeof(collection_value) != 'array' THEN
            RETURN FALSE;
        END IF;

        FOREACH search_value IN ARRAY search_values
        LOOP
            IF EXISTS (
                SELECT 1
                FROM jsonb_array_elements(collection_value) as element
                WHERE element ->> collection_key = search_value
            ) THEN
                RETURN TRUE;
            END IF;
        END LOOP;

        RETURN FALSE;
    END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION jsonb_to_timestamp(json_data jsonb, key text)
RETURNS timestamp AS $$
    BEGIN
        RETURN (SELECT TO_TIMESTAMP(json_data ->> key, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
    END;
$$ LANGUAGE plpgsql IMMUTABLE;


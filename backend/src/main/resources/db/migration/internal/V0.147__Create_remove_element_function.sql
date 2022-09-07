CREATE OR REPLACE FUNCTION f_array_remove_elem(anyarray, int)
    RETURNS anyarray LANGUAGE sql IMMUTABLE AS
'SELECT $1[:$2-1] || $1[$2+1:]';
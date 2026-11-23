-- `true` if the PNO must declare at least one catch (even with a null weight), `false` if it must declare none.
-- A NULL value means the rule does not filter on that criterion.
ALTER TABLE public.pno_type_rules
    ADD COLUMN has_declared_catches BOOLEAN;

ALTER TABLE public.vessels
    ADD COLUMN operator_mobile_phone VARCHAR(100),
    ADD COLUMN vessel_mobile_phone VARCHAR(100),
    ADD COLUMN vessel_telex VARCHAR(100),
    ADD COLUMN vessel_fax VARCHAR(100),
    ADD COLUMN operator_fax VARCHAR(100),
    ADD COLUMN operator_email VARCHAR(100),
    DROP COLUMN operator_emails;
CREATE TABLE public.vessel_contact_to_updates (
    id SERIAL PRIMARY KEY,
    vessel_id INT NOT NULL,
    contact_method TEXT,
    contact_method_should_be_checked BOOLEAN
);

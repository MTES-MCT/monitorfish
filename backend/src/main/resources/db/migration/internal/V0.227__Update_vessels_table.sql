CREATE INDEX vessels_external_immatriculation_idx 
ON public.vessels
USING btree (external_immatriculation);

CREATE INDEX vessels_ircs_idx 
ON public.vessels
USING btree (ircs);

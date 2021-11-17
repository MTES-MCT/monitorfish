UPDATE public.reglementation_peche SET law_type='Reg. MED' 
WHERE law_type='Reg locale' AND (facade='MED' OR facade='MÃ©diterranÃ©e, MED');

UPDATE public.reglementation_peche SET law_type='Reg. SA' 
WHERE law_type='Reg locale' AND (facade='SA' OR facade='Sud-Atlantique, SA');

UPDATE public.reglementation_peche SET law_type='Reg. NAMO' 
WHERE law_type='Reg locale' AND (facade='NAMO');

UPDATE public.reglementation_peche SET law_type='Reg. Outre-mer' 
WHERE law_type='Reg locale' AND (facade='Outre-mer');

UPDATE public.reglementation_peche SET law_type='R(CE) 494/2002' 
WHERE law_type='Reg 494 - Merlu';



 
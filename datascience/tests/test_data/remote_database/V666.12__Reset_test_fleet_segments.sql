DELETE FROM public.fleet_segments;

INSERT INTO public.fleet_segments (segment, segment_name, dirm, gears, fao_areas, target_species, bycatch_species, flag_states, impact_risk_factor) VALUES 
('SWW01/02/03', 'Bottom trawls', '{NAMO,SA}', '{OTB,OTT,PTB,OT,PT,TBN,TBS,TX,TB}', '{27.8.c,27.8,27.9}', '{HKE,SOL,ANF,MNZ,NEP}', '{LEZ,ANF}', '{FRA,ESP,PRT}', 3),
('SWW04', 'Midwater trawls', '{NAMO,SA}', '{OTM,PTM}', '{27.8.c,27.8}', '{HKE}', '{}', '{FRA,IRL}', 2.10000000000000009);
INSERT INTO public.position_alerts (
      id,                name,            description, is_user_defined, natinf_code, is_activated, is_in_error, error_reason,                                      validity_start_datetime_utc,                                          validity_end_datetime_utc, repeat_each_year, track_analysis_depth, only_fishing_positions,                                                                                                                          gears,                                                                                                 species,                                                                                       administrative_areas,                                                                                                                                                       regulatory_areas, min_depth, flag_states_iso2,               vessel_ids,  district_codes,  producer_organizations
) VALUES
(1, 'Chalutage dans les 3 milles', '_Sur les 8 dernières heures_

Pour tous les navires en pêche dans la zone des 3 milles ayant déclaré un chalut dans un FAR de leur marée, ou n''ayant pas encore fait de FAR.', false, 7059, true, false, NULL, NULL, NULL, false, 8, true, '[{"gear": "OT"}, {"gear": "OTB"}, {"gear": "OTM"}, {"gear": "OTP"}, {"gear": "OTT"}, {"gear": "PT"}, {"gear": "PTB"}, {"gear": "PTM"}, {"gear": "TB"}, {"gear": "TBB"}, {"gear": "TBN"}, {"gear": "TBS"}, {"gear": "TM"}, {"gear": "TMS"}, {"gear": "TX"}]', 'null', '[{"areas": ["0-3"], "area_type": "DISTANCE_TO_SHORE"}]', 'null', NULL, '{}', NULL, '{}', '{}'),
(2, 'Pêche en zone RTC par un navire français', '_Sur les 8 dernières heures_

Pour les navires français dans toutes les zones RTC du monde.', false, 2596, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', 'null', '[{"law_type": "Reg. RTC"}]', NULL, '{FR}', NULL, '{}', '{}'),
(3, 'Pêche en zone RTC par un navire étranger', '_Sur les 8 dernières heures_

Pour les navires étrangers dans les zones RTC de ZEE française', false, 2596, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', '[{"areas": ["FRA"], "area_type": "EEZ_AREA"}]', '[{"law_type": "Reg. RTC"}]', NULL, '{AD,AE,AF,AG,AI,AL,AM,AO,AQ,AR,AS,AT,AU,AW,AX,AZ,BA,BB,BD,BE,BF,BG,BH,BI,BJ,BL,BM,BN,BO,BQ,BR,BS,BT,BV,BW,BY,BZ,CA,CC,CD,CF,CG,CH,CI,CK,CL,CM,CN,CO,CR,CU,CV,CW,CX,CY,CZ,DE,DJ,DK,DM,DO,DZ,EC,EE,EG,EH,ER,ES,ET,FI,FJ,FK,FM,FO,GA,GB,GD,GE,GF,GG,GH,GI,GL,GM,GN,GP,GQ,GR,GS,GT,GU,GW,GY,HK,HM,HN,HR,HT,HU,ID,IE,IL,IM,IN,IO,IQ,IR,IS,IT,JE,JM,JO,JP,KE,KG,KH,KI,KM,KN,KP,KR,KW,KY,KZ,LA,LB,LC,LI,LK,LR,LS,LT,LU,LV,LY,MA,MC,MD,ME,MF,MG,MH,MK,ML,MM,MN,MO,MP,MQ,MR,MS,MT,MU,MV,MW,MX,MY,MZ,NA,NC,NE,NF,NG,NI,NL,NO,NP,NR,NU,NZ,OM,PA,PE,PF,PG,PH,PK,PL,PM,PN,PR,PS,PT,PW,PY,QA,RE,RO,RS,RU,RW,SA,SB,SC,SD,SE,SG,SH,SI,SJ,SK,SL,SM,SN,SO,SR,SS,ST,SV,SX,SY,SZ,TC,TD,TF,TG,TH,TJ,TK,TL,TM,TN,TO,TR,TT,TV,TW,TZ,UA,UG,UM,US,UY,UZ,VA,VC,VE,VG,VI,VN,VU,WF,WS,YE,YT,ZA,ZM,ZW}', NULL, '{}', '{}'),
(4, 'Pêche en ZEE française par un navire tiers', '_Sur les 8 dernières heures_

Pour tous les navires tiers en pêche en ZEE française.', false, 2608, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', '[{"areas": ["FRA"], "area_type": "EEZ_AREA"}]', 'null', NULL, '{AD,AE,AF,AG,AI,AL,AM,AO,AQ,AR,AS,AU,AW,AX,AZ,BA,BB,BD,BF,BH,BI,BJ,BL,BM,BN,BO,BQ,BR,BS,BT,BV,BW,BY,BZ,CA,CC,CD,CF,CG,CH,CI,CK,CL,CM,CN,CO,CR,CU,CV,CW,CX,DJ,DM,DO,DZ,EC,EG,EH,ER,ET,FJ,FK,FM,FO,GA,GB,GD,GE,GF,GG,GH,GI,GL,GM,GN,GP,GQ,GR,GS,GT,GU,GW,GY,HK,HM,HN,HT,ID,IL,IM,IN,IO,IQ,IR,IS,JE,JM,JO,JP,KE,KG,KH,KI,KM,KN,KP,KR,KW,KY,KZ,LA,LB,LC,LI,LK,LR,LS,LY,MA,MC,MD,ME,MF,MG,MH,MK,ML,MM,MN,MO,MP,MQ,MR,MS,MU,MV,MW,MX,MY,MZ,NA,NC,NE,NF,NG,NI,NO,NP,NR,NU,NZ,OM,PA,PE,PG,PH,PK,PM,PN,PR,PS,PW,PY,QA,RE,RS,RU,RW,SA,SB,SC,SD,SG,SH,SJ,SL,SM,SN,SO,SR,SS,ST,SV,SX,SY,SZ,TC,TD,TF,TG,TH,TJ,TK,TL,TM,TN,TO,TR,TT,TV,TW,TZ,UA,UG,UM,US,UY,UZ,VA,VC,VG,VI,VN,VU,WF,WS,YE,YT,ZA,ZM,ZW}', NULL, '{}', '{}'),
(5, 'Pêche dans les 12 milles sans droits historiques (BE, NL)', '_Sur les 8 dernières heures_

Pour les navires belges et néerlandais en pêche dans les 12 milles hors de leurs zones de droits historiques.', false, 2610, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', '[{"areas": ["0-12_MINUS_BE_AND_NL_FISHING_AREAS"], "area_type": "DISTANCE_TO_SHORE"}]', 'null', NULL, '{BE,NL}', NULL, '{}', '{}'),
(6, 'Pêche dans les 12 milles sans droits historiques (ES)', '_Sur les 8 dernières heures_

Pour les navires espagnols en pêche dans les 12 milles hors de leurs zones de droits historiques.', false, 2610, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', '[{"areas": ["0-12_MINUS_ES_FISHING_AREA"], "area_type": "DISTANCE_TO_SHORE"}]', 'null', NULL, '{ES}', NULL, '{}', '{}'),
(7, 'Pêche dans les 12 milles sans droits historiques (DE)', '_Sur les 8 dernières heures_

Pour les navires allemands en pêche dans les 12 milles hors de leurs zones de droits historiques.', false, 2610, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', '[{"areas": ["0-12_MINUS_DE_FISHING_AREA"], "area_type": "DISTANCE_TO_SHORE"}]', 'null', NULL, '{DE}', NULL, '{}', '{}'),
(8, 'Pêche dans les 12 milles sans droits historiques', '_Sur les 8 dernières heures_

Pour tous les navires UE - hors navires allemands, espagnols, néerlandais et belges - ou tiers en pêche dans les 12 milles.', false, 2610, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', '[{"areas": ["0-3", "3-6", "6-12", "0-12"], "area_type": "DISTANCE_TO_SHORE"}]', 'null', NULL, '{AD,AE,AF,AG,AI,AL,AM,AO,AQ,AR,AS,AT,AU,AW,AX,AZ,BA,BB,BD,BF,BG,BH,BI,BJ,BL,BM,BN,BO,BQ,BR,BS,BT,BV,BW,BY,BZ,CA,CC,CD,CF,CG,CH,CI,CK,CL,CM,CN,CO,CR,CU,CV,CW,CX,CY,CZ,DJ,DK,DM,DO,DZ,EC,EE,EG,EH,ER,ET,FI,FJ,FK,FM,FO,GA,GB,GD,GE,GF,GG,GH,GI,GL,GM,GN,GP,GQ,GR,GS,GT,GU,GW,GY,HK,HM,HN,HR,HT,HU,ID,IE,IL,IM,IN,IO,IQ,IR,IS,IT,JE,JM,JO,JP,KE,KG,KH,KI,KM,KN,KP,KR,KW,KY,KZ,LA,LB,LC,LI,LK,LR,LS,LT,LU,LV,LY,MA,MC,MD,ME,MF,MG,MH,MK,ML,MM,MN,MO,MP,MQ,MR,MS,MT,MU,MV,MW,MX,MY,MZ,NA,NC,NE,NF,NG,NI,NO,NP,NR,NU,NZ,OM,PA,PE,PG,PH,PK,PL,PM,PN,PR,PS,PT,PW,PY,QA,RE,RO,RS,RU,RW,SA,SB,SC,SD,SE,SG,SH,SI,SJ,SK,SL,SM,SN,SO,SR,SS,ST,SV,SX,SY,SZ,TC,TD,TF,TG,TH,TJ,TK,TL,TM,TN,TO,TR,TT,TV,TW,TZ,UA,UG,UM,US,UY,UZ,VA,VC,VG,VI,VN,VU,WF,WS,YE,YT,ZA,ZM,ZW}', NULL, '{}', '{}'),
(9, 'Pêche en zone CPANE (NEAFC)', '_Sur les 8 dernières heures_

Pêche en zone CPANE (NEAFC).', false, 22070, true, false, NULL, NULL, NULL, false, 8, true, 'null', 'null', '[{"areas": [1], "area_type": "NEAFC_AREA"}]', 'null', NULL, '{}', NULL, '{}', '{}'),
(10, 'R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord', '_Sur les 8 dernières heures_

Pour tous les navires sur les areas REG "EOS - Lingues bleues", avec plus de 6 tonnes de BLI à bord.
    ', false, 12900, true, false, NULL, NULL, NULL, false, 8, false, 'null', '[{"species": "BLI", "min_weight": 6000.0}]', 'null', '[{"topic": "EOS - Lingues bleues"}]', NULL, '{}', NULL, '{}', '{}'),
(11, 'Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur', '_Sur les 8 dernières heures_

Pour tous les navires en pêche sur la zone REG "Atlantique 400m - Ecosystèmes Marins Vulnérables (EMV) - Engins de fond",
à une profondeur supérieure à 400m avec les engins :
- TB (Chaluts de fond (non spécifiés))
- GNS (Filets maillants calés (ancrés))
- LLS (Palangres calées)
- LVS (Palangre verticale de fond)
- OTB (Chaluts de fond à panneaux)
- OTT (Chaluts jumeaux à panneaux)
- PTB (Chaluts-bœufs de fond)
- TBB (Chaluts à perche)
- TBN (Chaluts à langoustines)
- TBS (Chaluts de fond à crevettes)
- Dragues
- Pièges et casiers
    ', false, 2610, true, false, NULL, NULL, NULL, false, 8, true, '[{"gear": "OTB"}, {"gear": "OTT"}, {"gear": "PTB"}, {"gear": "TB"}, {"gear": "TBB"}, {"gear": "TBN"}, {"gear": "TBS"}, {"gear": "DHB"}, {"gear": "DHS"}, {"gear": "DRB"}, {"gear": "DRH"}, {"gear": "DRM"}, {"gear": "HMD"}, {"gear": "GNS"}, {"gear": "LLS"}, {"gear": "LVS"}, {"gear": "FAG"}, {"gear": "FAR"}, {"gear": "FIX"}, {"gear": "FPN"}, {"gear": "FPO"}, {"gear": "FSN"}, {"gear": "FWR"}, {"gear": "FYK"}]', 'null', 'null', '[{"zone": "Interdiction de pêche aux engins de fond 1", "topic": "Atlantique 400m - Ecosystèmes Marins Vulnérables (EMV) - Engins de fond"}, {"zone": "Interdiction de pêche aux engins de fond 2", "topic": "Atlantique 400m - Ecosystèmes Marins Vulnérables (EMV) - Engins de fond"}]', 400, '{}', NULL, '{}', '{}'),
(12, 'Chalutage de fond à plus de 800m de profondeur', '_Sur les 8 dernières heures_

Pour tous les navires en pêche sur la zone REG "Interdiction chalutage de fond ATL - Profondeur supérieure à 800m", à une profondeur supérieure à 800m avec les engins :
- TB (Chaluts de fond (non spécifiés))
- OTB (Chaluts de fond à panneaux)
- OTT (Chaluts jumeaux à panneaux)
- PTB (Chaluts-bœufs de fond)
- TBB (Chaluts à perche)
- TBN (Chaluts à langoustines)
- TBS (Chaluts de fond à crevettes)
    ', false, 2610, true, false, NULL, NULL, NULL, false, 8, true, '[{"gear": "TB"}, {"gear": "OTB"}, {"gear": "OTT"}, {"gear": "PTB"}, {"gear": "TBB"}, {"gear": "TBN"}, {"gear": "TBS"}]', 'null', 'null', '[{"zone": "Interdiction chalutage de fond ATL - Profondeur supérieure à 800m", "topic": "Atlantique 800m - Zones pêche en eau profonde EMV - Chaluts"}]', 800, '{}', NULL, '{}', '{}');

SELECT setval('position_alerts_id_seq', (SELECT MAX(id) FROM position_alerts));
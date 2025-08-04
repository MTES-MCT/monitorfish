DELETE FROM pending_alerts;

-- Update silenced_alerts
UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 1, "name": "Chalutage dans les 3 milles"}'
WHERE value->>'type'= 'THREE_MILES_TRAWLING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 2, "name": "Pêche en zone RTC par un navire français"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state = 'FR';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 3, "name": "Pêche en zone RTC par un navire étranger"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state != 'FR';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 4, "name": "Pêche en ZEE française par un navire tiers"}'
WHERE value->>'type'= 'FRENCH_EEZ_FISHING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 5, "name": "Pêche dans les 12 milles sans droits historiques (BE, NL)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state IN ('BE', 'NL');

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 6, "name": "Pêche dans les 12 milles sans droits historiques (ES)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'ES';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 7, "name": "Pêche dans les 12 milles sans droits historiques (DE)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'DE';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 8, "name": "Pêche dans les 12 milles sans droits historiques"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND NOT flag_state IN ('BE', 'NL', 'ES', 'DE');

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 9, "name": "Pêche en zone CPANE (NEAFC)"}'
WHERE value->>'type'= 'NEAFC_FISHING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 10, "name": "R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord"}'
WHERE value->>'type'= 'BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 11, "name": "Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_GEAR_VME_FISHING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 12, "name": "Chalutage de fond à plus de 800m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_TRAWL_800_METERS_FISHING_ALERT';

-- Update reportings
UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 1, "name": "Chalutage dans les 3 milles"}'
WHERE value->>'type'= 'THREE_MILES_TRAWLING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 2, "name": "Pêche en zone RTC par un navire français"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state = 'FR';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 3, "name": "Pêche en zone RTC par un navire étranger"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state != 'FR';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 4, "name": "Pêche en ZEE française par un navire tiers"}'
WHERE value->>'type'= 'FRENCH_EEZ_FISHING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 5, "name": "Pêche dans les 12 milles sans droits historiques (BE, NL)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state IN ('BE', 'NL');

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 6, "name": "Pêche dans les 12 milles sans droits historiques (ES)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'ES';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 7, "name": "Pêche dans les 12 milles sans droits historiques (DE)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'DE';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 8, "name": "Pêche dans les 12 milles sans droits historiques"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND NOT flag_state IN ('BE', 'NL', 'ES', 'DE');

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 9, "name": "Pêche en zone CPANE (NEAFC)"}'
WHERE value->>'type'= 'NEAFC_FISHING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 10, "name": "R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord"}'
WHERE value->>'type'= 'BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 11, "name": "Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_GEAR_VME_FISHING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alert_id": 12, "name": "Chalutage de fond à plus de 800m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_TRAWL_800_METERS_FISHING_ALERT';

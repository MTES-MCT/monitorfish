DELETE FROM pending_alerts;

-- Update silenced_alerts
UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 1, "name": "Chalutage dans les 3 milles"}'
WHERE value->>'type'= 'THREE_MILES_TRAWLING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 2, "name": "Pêche en zone RTC par un navire français"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state = 'FR';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 3, "name": "Pêche en zone RTC par un navire étranger"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state != 'FR';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 4, "name": "Pêche en ZEE française par un navire tiers"}'
WHERE value->>'type'= 'FRENCH_EEZ_FISHING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 5, "name": "Pêche dans les 12 milles sans droits historiques (BE, NL)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state IN ('BE', 'NL');

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 6, "name": "Pêche dans les 12 milles sans droits historiques (ES)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'ES';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 7, "name": "Pêche dans les 12 milles sans droits historiques (DE)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'DE';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 8, "name": "Pêche dans les 12 milles sans droits historiques"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND NOT flag_state IN ('BE', 'NL', 'ES', 'DE');

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 9, "name": "Pêche en zone CPANE (NEAFC)"}'
WHERE value->>'type'= 'NEAFC_FISHING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 10, "name": "R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord"}'
WHERE value->>'type'= 'BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 11, "name": "Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_GEAR_VME_FISHING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"type": "POSITION_ALERT", "alertId": 12, "name": "Chalutage de fond à plus de 800m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_TRAWL_800_METERS_FISHING_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"name": "FAR manquant en 24h"}'
WHERE value->>'type'= 'MISSING_FAR_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"name": "FAR manquant en 48h"}'
WHERE value->>'type'= 'MISSING_FAR_48_HOURS_ALERT';

UPDATE public.silenced_alerts
SET value = value || '{"name": "Sortie sans émission de message \"DEP\""}'
WHERE value->>'type'= 'MISSING_DEP_ALERT:';

UPDATE public.silenced_alerts
SET value = value || '{"name": "Suspicion de sous-déclaration"}'
WHERE value->>'type'= 'SUSPICION_OF_UNDER_DECLARATION_ALERT';

-- Update reportings
UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 1, "name": "Chalutage dans les 3 milles"}'
WHERE value->>'type'= 'THREE_MILES_TRAWLING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 2, "name": "Pêche en zone RTC par un navire français"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state = 'FR';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 3, "name": "Pêche en zone RTC par un navire étranger"}'
WHERE value->>'type'= 'RTC_FISHING_ALERT' AND flag_state != 'FR';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 4, "name": "Pêche en ZEE française par un navire tiers"}'
WHERE value->>'type'= 'FRENCH_EEZ_FISHING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 5, "name": "Pêche dans les 12 milles sans droits historiques (BE, NL)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state IN ('BE', 'NL');

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 6, "name": "Pêche dans les 12 milles sans droits historiques (ES)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'ES';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 7, "name": "Pêche dans les 12 milles sans droits historiques (DE)"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND flag_state = 'DE';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 8, "name": "Pêche dans les 12 milles sans droits historiques"}'
WHERE value->>'type'= 'TWELVE_MILES_FISHING_ALERT' AND NOT flag_state IN ('BE', 'NL', 'ES', 'DE');

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 9, "name": "Pêche en zone CPANE (NEAFC)"}'
WHERE value->>'type'= 'NEAFC_FISHING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 10, "name": "R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord"}'
WHERE value->>'type'= 'BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 11, "name": "Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_GEAR_VME_FISHING_ALERT';

UPDATE public.reportings
SET value = value || '{"type": "POSITION_ALERT", "alertId": 12, "name": "Chalutage de fond à plus de 800m de profondeur"}'
WHERE value->>'type'= 'BOTTOM_TRAWL_800_METERS_FISHING_ALERT';

UPDATE public.reportings
SET value = value || '{"name": "FAR manquant en 24h"}'
WHERE value->>'type'= 'MISSING_FAR_ALERT';

UPDATE public.reportings
SET value = value || '{"name": "FAR manquant en 48h"}'
WHERE value->>'type'= 'MISSING_FAR_48_HOURS_ALERT';

UPDATE public.reportings
SET value = value || '{"name": "Sortie sans émission de message \"DEP\""}'
WHERE value->>'type'= 'MISSING_DEP_ALERT:';

UPDATE public.reportings
SET value = value || '{"name": "Suspicion de sous-déclaration"}'
WHERE value->>'type'= 'SUSPICION_OF_UNDER_DECLARATION_ALERT';
// TODO This is a bit shady to mix up pending/silenced alerts with PNO ones here.

import {
  ALL_SEAFRONT_GROUP,
  type AllSeafrontGroup,
  Seafront,
  SEAFRONT_GROUP_SEAFRONTS,
  SeafrontGroup
} from '@constants/seafront'

import type { MenuItem } from '../../types'

export enum PendingAlertValueType {
  BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT = 'BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT',
  BOTTOM_GEAR_VME_FISHING_ALERT = 'BOTTOM_GEAR_VME_FISHING_ALERT',
  BOTTOM_TRAWL_800_METERS_FISHING_ALERT = 'BOTTOM_TRAWL_800_METERS_FISHING_ALERT',
  FRENCH_EEZ_FISHING_ALERT = 'FRENCH_EEZ_FISHING_ALERT',
  MISSING_DEP_ALERT = 'MISSING_DEP_ALERT',
  MISSING_FAR_48_HOURS_ALERT = 'MISSING_FAR_48_HOURS_ALERT',
  MISSING_FAR_ALERT = 'MISSING_FAR_ALERT',
  NEAFC_FISHING_ALERT = 'NEAFC_FISHING_ALERT',
  RTC_FISHING_ALERT = 'RTC_FISHING_ALERT',
  SUSPICION_OF_UNDER_DECLARATION_ALERT = 'SUSPICION_OF_UNDER_DECLARATION_ALERT',
  THREE_MILES_TRAWLING_ALERT = 'THREE_MILES_TRAWLING_ALERT',
  TWELVE_MILES_FISHING_ALERT = 'TWELVE_MILES_FISHING_ALERT'
}

export type AlertMenuItem = MenuItem<PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT'> & {
  archivingRule: string
  endRule: string
  frequency: string
  isArchivedAfterDEPMessage: boolean
  isOperationalAlert: boolean
  nameWithAlertDetails?: Function
  rules: string
}

export const COMMON_ALERT_TYPE_OPTION: Record<PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT', AlertMenuItem> =
  {
    BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT: {
      archivingRule: "Pas d'archivage automatique des signalements.",
      code: PendingAlertValueType.BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les heures, de mars à mai.',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: true,
      name: 'R(UE) 1241 - Plus de 6 tonnes de lingue bleue (BLI) à bord',
      rules: `_Sur les 8 dernières heures_

Pour tous les navires sur les zones REG "EOS - Lingues bleues", avec plus de 6 tonnes de BLI à bord.
    `
    },
    BOTTOM_GEAR_VME_FISHING_ALERT: {
      archivingRule: "Pas d'archivage automatique des signalements.",
      code: PendingAlertValueType.BOTTOM_GEAR_VME_FISHING_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les 30 minutes.',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: true,
      name: 'Pêche en zone EMV avec un engin de fond à plus de 400m de profondeur',
      rules: `_Sur les 8 dernières heures_

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
    `
    },
    BOTTOM_TRAWL_800_METERS_FISHING_ALERT: {
      archivingRule: "Pas d'archivage automatique des signalements.",
      code: PendingAlertValueType.BOTTOM_TRAWL_800_METERS_FISHING_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les 30 minutes.',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: true,
      name: 'Chalutage de fond à plus de 800m de profondeur',
      rules: `_Sur les 8 dernières heures_

Pour tous les navires en pêche sur la zone REG "Interdiction chalutage de fond ATL - Profondeur supérieure à 800m", à une profondeur supérieure à 800m avec les engins :
- TB (Chaluts de fond (non spécifiés))
- OTB (Chaluts de fond à panneaux)
- OTT (Chaluts jumeaux à panneaux)
- PTB (Chaluts-bœufs de fond)
- TBB (Chaluts à perche)
- TBN (Chaluts à langoustines)
- TBS (Chaluts de fond à crevettes)
    `
    },
    FRENCH_EEZ_FISHING_ALERT: {
      archivingRule: "Pas d'archivage automatique des signalements.",
      code: PendingAlertValueType.FRENCH_EEZ_FISHING_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les 10 minutes.',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: true,
      name: 'Pêche en ZEE française par un navire tiers',
      rules: `_Sur les 8 dernières heures_

Pour tous les navires tiers en pêche en ZEE française.`
    },
    MISSING_DEP_ALERT: {
      archivingRule: 'Signalement archivé automatiquement si le navire fait un DEP.',
      code: PendingAlertValueType.MISSING_DEP_ALERT,
      endRule: "Si le navire a fait un DEP à la mise à jour suivante de l'alerte (20 min plus tard)",
      frequency: 'Toutes les 10 minutes.',
      isArchivedAfterDEPMessage: true,
      isOperationalAlert: true,
      name: 'Sortie sans émission de message "DEP"',
      rules: `_Dans une fenêtre de +/- 6h autour de la sortie de port détectée._

Pour les navires français de +12 m (à l'exclusion des exemptés de JPE) n'ayant pas fait de DEP.
La sortie de port est détectée sur les dernières 48h, avec le navire en mer depuis au moins 2h.`
    },
    MISSING_FAR_48_HOURS_ALERT: {
      archivingRule: 'Signalement archivé automatiquement quand le navire fait un nouveau DEP.',
      code: PendingAlertValueType.MISSING_FAR_48_HOURS_ALERT,
      endRule: 'Si non validée en 24h',
      frequency: 'Toutes les 10 minutes.',
      isArchivedAfterDEPMessage: true,
      isOperationalAlert: true,
      name: 'FAR manquant en 48h',
      rules: `_Sur la journée de la veille et de l'avant-veille_

Mêmes règles que pour l'alerte "FAR manquant en 24h" mais sur 2 jours consécutifs.
    `
    },
    MISSING_FAR_ALERT: {
      archivingRule:
        "Signalement archivé automatiquement dès sa création : il sert à garder une trace pour la statistique mais n'est pas utilisé directement pour l'opérationnel.",
      code: PendingAlertValueType.MISSING_FAR_ALERT,
      endRule: "Pas de fin : l'alerte est validée automatiquement.",
      frequency: 'Toutes les 10 minutes.',
      isArchivedAfterDEPMessage: true,
      isOperationalAlert: true,
      name: 'FAR manquant en 24h',
      rules: `_Sur la journée de la veille_

Pour tous les navires français et pour les navires étrangers dont on a le JPE en ZEE française (aujourd'hui les Belges), qui ont été détectés "en pêche" la veille et n'ont pas fait de FAR.
    `
    },
    NEAFC_FISHING_ALERT: {
      archivingRule: "Pas d'archivage automatique des signalements.",
      code: PendingAlertValueType.NEAFC_FISHING_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les heures.',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: true,
      name: 'Pêche en zone CPANE (NEAFC)',
      rules: `_Sur les 8 dernières heures_

Pêche en zone CPANE (NEAFC).`
    },
    PNO_LAN_WEIGHT_TOLERANCE_ALERT: {
      archivingRule: '',
      code: 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
      endRule: '',
      frequency: '',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: false,
      name: 'Tolérance 10% non respectée',
      nameWithAlertDetails: (percentOfTolerance, minimumWeightThreshold) =>
        `Tolérance de ${percentOfTolerance}% non respectée, appliquée pour un poids minimum de ${minimumWeightThreshold}kg.`,
      rules: ''
    },
    RTC_FISHING_ALERT: {
      archivingRule: "Pas d'archivage automatique des signalements.",
      code: PendingAlertValueType.RTC_FISHING_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les 10 minutes.',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: true,
      name: 'Pêche en zone RTC',
      rules: `_Sur les 8 dernières heures_

Pour les navires français dans toutes les zones RTC du monde.
Pour les autres navires dans les zones RTC de ZEE française`
    },
    SUSPICION_OF_UNDER_DECLARATION_ALERT: {
      archivingRule: 'Signalement archivé automatiquement quand le navire fait un nouveau DEP.',
      code: PendingAlertValueType.SUSPICION_OF_UNDER_DECLARATION_ALERT,
      endRule: 'Si non validée en 24h',
      frequency: 'Tous les jours, à 6h57 UTC',
      isArchivedAfterDEPMessage: true,
      isOperationalAlert: true,
      name: 'Suspicion de sous-déclaration',
      rules: `_Sur les 7 jours précédents_

Pour les navires français de + 12 m qui déclarent un poids de captures incohérent par rapport à leur effort de pêche.
Permet de détecter des navires qui font des FAR 0 à répétition ou des FAR avec quelques kilos.

_Effort de pêche = nb d'heures de pêche x puissance motrice en kW/h.
Les navires remontent si kg des FAR < 0,015 kg x effort de pêche (kW/h)_
    `
    },
    THREE_MILES_TRAWLING_ALERT: {
      archivingRule: 'Signalement archivé automatiquement quand le navire fait un nouveau DEP.',
      code: PendingAlertValueType.THREE_MILES_TRAWLING_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les 10 minutes.',
      isArchivedAfterDEPMessage: true,
      isOperationalAlert: true,
      name: 'Chalutage dans les 3 milles',
      rules: `_Sur les 8 dernières heures_

Pour tous les navires en pêche dans la zone des 3 milles ayant déclaré un chalut dans un FAR de leur marée, ou n'ayant pas encore fait de FAR.`
    },
    TWELVE_MILES_FISHING_ALERT: {
      archivingRule: "Pas d'archivage automatique des signalements.",
      code: PendingAlertValueType.TWELVE_MILES_FISHING_ALERT,
      endRule: 'Si non validée en 8h',
      frequency: 'Toutes les 10 minutes.',
      isArchivedAfterDEPMessage: false,
      isOperationalAlert: true,
      name: 'Pêche dans les 12 milles sans droits historiques',
      rules: `_Sur les 8 dernières heures_

Pour les navires allemands, espagnols, néerlandais et belges en pêche dans les 12 milles hors de leurs zones de droits historiques propres.
Et pour tous les autres navires UE ou tiers en pêche dans les 12 milles.`
    }
  }

export const ALERTS_MENU_SEAFRONT_TO_SEAFRONTS: Record<
  SeafrontGroup | AllSeafrontGroup,
  {
    menuSeafront: SeafrontGroup | AllSeafrontGroup
    seafronts: Seafront[]
  }
> = {
  ALL: {
    menuSeafront: ALL_SEAFRONT_GROUP,
    seafronts: [
      Seafront.CORSE,
      Seafront.GUADELOUPE,
      Seafront.GUYANE,
      Seafront.MARTINIQUE,
      Seafront.MAYOTTE,
      Seafront.MED,
      Seafront.MEMN,
      Seafront.NAMO,
      Seafront.SA,
      Seafront.SUD_OCEAN_INDIEN
    ]
  },
  MED: {
    menuSeafront: SeafrontGroup.MED,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.MED
  },
  MEMN: {
    menuSeafront: SeafrontGroup.MEMN,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.MEMN
  },
  NAMO: {
    menuSeafront: SeafrontGroup.NAMO,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.NAMO
  },
  OUTREMEROA: {
    menuSeafront: SeafrontGroup.OUTREMEROA,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.OUTREMEROA
  },
  OUTREMEROI: {
    menuSeafront: SeafrontGroup.OUTREMEROI,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.OUTREMEROI
  },
  SA: {
    menuSeafront: SeafrontGroup.SA,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.SA
  }
}

export enum SilencedAlertPeriod {
  CUSTOM = 'CUSTOM',
  ONE_DAY = 'ONE_DAY',
  ONE_HOUR = 'ONE_HOUR',
  ONE_MONTH = 'ONE_MONTH',
  ONE_WEEK = 'ONE_WEEK',
  ONE_YEAR = 'ONE_YEAR',
  SIX_HOURS = 'SIX_HOURS',
  THIS_OCCURRENCE = 'THIS_OCCURRENCE',
  TWELVE_HOURS = 'TWELVE_HOURS',
  TWO_HOURS = 'TWO_HOURS'
}

export const OPERATIONAL_ALERTS: AlertMenuItem[] = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isOperationalAlert)

export const ALERTS_ARCHIVED_AFTER_NEW_VOYAGE: string[] = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isArchivedAfterDEPMessage)
  .map(alert => alert.code)

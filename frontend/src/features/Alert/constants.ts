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
  MISSING_DEP_ALERT = 'MISSING_DEP_ALERT',
  MISSING_FAR_48_HOURS_ALERT = 'MISSING_FAR_48_HOURS_ALERT',
  MISSING_FAR_ALERT = 'MISSING_FAR_ALERT',
  POSITION_ALERT = 'POSITION_ALERT',
  SUSPICION_OF_UNDER_DECLARATION_ALERT = 'SUSPICION_OF_UNDER_DECLARATION_ALERT'
}

export type AlertMenuItem = MenuItem<PendingAlertValueType> & {
  archivingRule: string
  endRule: string
  frequency: string
  isArchivedAfterDEPMessage: boolean
  isOperationalAlert: boolean
  nameWithAlertDetails?: Function
  rules: string
}

export const COMMON_ALERT_TYPE_OPTION: Record<Exclude<PendingAlertValueType, 'POSITION_ALERT'>, AlertMenuItem> = {
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

export const EXTRA_OPERATIONAL_ALERTS: AlertMenuItem[] = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isOperationalAlert)

export const ALERTS_ARCHIVED_AFTER_NEW_VOYAGE: string[] = Object.keys(COMMON_ALERT_TYPE_OPTION)
  .map(alertTypeName => COMMON_ALERT_TYPE_OPTION[alertTypeName])
  .filter(alertType => alertType.isArchivedAfterDEPMessage)
  .map(alert => alert.code)

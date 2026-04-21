import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export const SWORDFISH_SPECY_CODE = 'SWO'
export const BLUEFIN_TUNA_SPECY_CODE = 'BFT'
export const BLUEFIN_TUNA_EXTENDED_SPECY_CODES = ['BF1', 'BF2', 'BF3']
export const BLUEFIN_TUNA_NAME_FR = `Thon rouge de l'Atlantique`
export const BLUEFIN_TUNA_NAME_FR_SIZE_1 = `Thon rouge de l'Atlantique (Calibre 1)`
export const BLUEFIN_TUNA_NAME_FR_SIZE_2 = `Thon rouge de l'Atlantique (Calibre 2)`
export const BLUEFIN_TUNA_NAME_FR_SIZE_3 = `Thon rouge de l'Atlantique (Calibre 3)`

export enum OpenedPriorNotificationType {
  LogbookForm = 'LogbookForm',
  ManualForm = 'ManualForm'
}

export const PnoVerificationScopeReasonLabel: Record<PriorNotification.PnoVerificationScopeReason, string> = {
  FOREIGN_FLAG_COUNTRY: '- navire tiers',
  FOREIGN_PORT: '- port tiers',
  HIGH_RISK_FACTOR: '- note  ≥ 2,3',
  MISSING_DATA: '- données manquantes',
  OPEN_REPORTING: '- susp. d’inf.'
}

export const PnoVerificationScopeReasonLongLabel: Record<PriorNotification.PnoVerificationScopeReason, string> = {
  FOREIGN_FLAG_COUNTRY: '(navire d’un État tiers débarquant dans un port français)',
  FOREIGN_PORT: '(navire français débarquant dans le port d’un État tiers)',
  HIGH_RISK_FACTOR: '(note de risque du navire égale ou supérieure à 2,3)',
  MISSING_DATA: '(données manquantes)',
  OPEN_REPORTING: '(suspicion d’infraction ouverte)'
}

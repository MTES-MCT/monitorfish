import { PendingAlertValueType } from '@features/Alert/constants'
import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

import type { NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import type { AlertSpecification } from '@features/Alert/types'

export enum AdditionalSubMenu {
  ALERT_MANAGEMENT = 'ALERT_MANAGEMENT',
  SUSPENDED_ALERTS = 'SUSPENDED_ALERTS'
}

export type AlertSubMenu = SeafrontGroup | NoSeafrontGroup | AdditionalSubMenu

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const SUB_MENU_LABEL: Record<AlertSubMenu, string> = {
  MEMN: 'MEMN',
  NAMO: 'NAMO',
  SA: 'SA',
  MED: 'MED',
  OUTREMEROA: 'OUTRE-MER OA',
  OUTREMEROI: 'OUTRE-MER OI',
  NONE: 'Hors façade',
  SUSPENDED_ALERTS: 'Suspension d’alertes',
  ALERT_MANAGEMENT: 'Gestion alertes'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const ALERT_SUB_MENU_OPTIONS = getOptionsFromLabelledEnum(SUB_MENU_LABEL)

export const DEFAULT_EDITED_ALERT_SPECIFICATION: AlertSpecification = {
  administrativeAreas: [],
  createdAtUtc: '',
  createdBy: '',
  description: '',
  districtCodes: [],
  errorReason: undefined,
  flagStatesIso2: [],
  gears: [],
  hasAutomaticArchiving: false,
  id: undefined,
  isActivated: false,
  isInError: false,
  isUserDefined: true,
  minDepth: undefined,
  name: '',
  natinf: 0,
  onlyFishingPositions: false,
  producerOrganizations: [],
  regulatoryAreas: [],
  repeatEachYear: false,
  species: [],
  speciesCatchAreas: [],
  threat: '',
  threatCharacterization: '',
  threatHierarchy: undefined,
  trackAnalysisDepth: 8,
  type: PendingAlertValueType.POSITION_ALERT,
  validityEndDatetimeUtc: undefined,
  validityStartDatetimeUtc: undefined,
  vesselIds: [],
  vessels: []
}

export const FISHING_POSITION_ONLY_AS_OPTIONS = [
  { label: 'Toutes les positions en mer', value: false },
  { label: 'Les positions en pêche uniquement', value: true }
]

export const VALIDITY_PERIOD_AS_OPTIONS = [
  { label: 'En tous temps', value: 'ALL_TIME' },
  { label: 'Sur une période donnée', value: 'PERIOD' }
]

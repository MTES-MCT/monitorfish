import { isCypress } from '@utils/isCypress'

import { MissionAction } from '../../missionAction.types'

import type { MissionActionFormValues } from './types'
import type { LegacyControlUnit } from '../../../ControlUnit/legacyControlUnit'
import type { Option, Undefine } from '@mtes-mct/monitor-ui'

import CompletionStatus = MissionAction.CompletionStatus

export const INITIAL_MISSION_CONTROL_UNIT: LegacyControlUnit.LegacyControlUnitDraft = {
  administration: undefined,
  contact: undefined,
  id: undefined,
  isArchived: undefined,
  name: undefined,
  resources: []
}

export const MISSION_ACTION_FORM_VALUES_SKELETON: Undefine<MissionActionFormValues> = {
  actionDatetimeUtc: undefined,
  actionType: undefined,
  approvedWeighingOperatorInformation: undefined,
  catchesWeighedAtLanding: undefined,
  completion: CompletionStatus.TO_COMPLETE,
  controlQualityComments: undefined,
  controlUnits: [],
  cratesWeighingSamplingControl: undefined,
  emitsAis: undefined,
  emitsVms: undefined,
  facade: undefined,
  fishingLicencesMatchActivity: undefined,
  gearOnboard: [],
  holdControlledAfterUnloading: undefined,
  id: undefined,
  infractions: [],
  isAdministrativeControl: undefined,
  isComplianceWithWaterRegulationsControl: undefined,
  isGangwayDeployed: undefined,
  isINNControl: undefined,
  isSafetyEquipmentAndStandardsComplianceControl: undefined,
  isSeafarersControl: undefined,
  isValid: false,
  latitude: undefined,
  licencesAndLogbookObservations: undefined,
  licencesMatchActivity: undefined,
  logbookFilledPriorToControl: undefined,
  logbookMatchesActivity: undefined,
  longitude: undefined,
  minimumConservationReferenceSizeControlled: undefined,
  numberOfVesselsFlownOver: undefined,
  onboardWeighingPermit: undefined,
  otherComments: undefined,
  portEntranceAndLandingAuthorized: undefined,
  portLocode: undefined,
  propulsionEnginePowerControl: undefined,
  segments: [],
  seizureAndDiversion: undefined,
  seizureAndDiversionComments: undefined,
  separateStowageOfPreservedSpecies: undefined,
  speciesObservations: undefined,
  speciesOnboard: [],
  speciesSizeControlled: undefined,
  speciesWeightControlled: undefined,
  stowagePlanPresent: undefined,
  underSizedSeparateRecording: undefined,
  underSizedSeparateStowage: undefined,
  unitWithoutOmegaGauge: undefined,
  userTrigram: undefined,
  vesselId: undefined,
  vesselName: undefined,
  vesselTargeted: undefined,
  vmsEmissionControlBeforeArrival: undefined,
  weighingCertificateAndSystemsValid: undefined
}

export const CONTROL_CHECKS_AS_OPTIONS: Option[] = [
  { label: 'Oui', value: MissionAction.ControlCheck.YES },
  { label: 'Non', value: MissionAction.ControlCheck.NO },
  { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
]

export const BOOLEAN_AS_CONTROL_CHECK_OPTIONS: Option[] = [
  { label: 'Oui', value: MissionAction.ControlCheck.YES },
  { label: 'Non', value: MissionAction.ControlCheck.NO }
]

/**
 * Is auto-save enabled.
 *
 * When running Cypress tests, we modify this env var in spec file, so we use `window.Cypress.env()`
 * instead of `import.meta.env`.
 */
export const AUTO_SAVE_ENABLED = isCypress()
  ? // @ts-ignore
    window.Cypress.env().FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED
  : import.meta.env.FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED === 'true'

/**
 * Is the e-ISR feature enabled.
 *
 * When running Cypress tests, we modify this env var in spec file, so we use `window.Cypress.env()`
 * instead of `import.meta.env`.
 */
export const E_ISR_ENABLED = isCypress()
  ? // @ts-ignore
    window.Cypress.env().FRONTEND_E_ISR_ENABLED
  : import.meta.env.FRONTEND_E_ISR_ENABLED === 'true'

const rawEIsrControlUnits: string = isCypress()
  ? // @ts-ignore
    (window.Cypress.env().FRONTEND_E_ISR_CONTROL_UNITS_FOR_TEST ?? '')
  : (import.meta.env.FRONTEND_E_ISR_CONTROL_UNITS_FOR_TEST ?? '')

/**
 * Control unit IDs allowed to see e-ISR fields.
 * Empty array = no restriction (all units see e-ISR fields when E_ISR_ENABLED is true).
 */
export const E_ISR_CONTROL_UNITS_FOR_TEST: number[] = rawEIsrControlUnits
  ? String(rawEIsrControlUnits).split(',').map(Number).filter(Boolean)
  : []

/**
 * ISO date from which controls fall under e-ISR. Empty = no date filtering.
 *
 * When running Cypress tests, we modify this env var in spec file, so we use `window.Cypress.env()`
 * instead of `import.meta.env`.
 */
export const E_ISR_APPLICATION_DATE: string = isCypress()
  ? // @ts-ignore
    (window.Cypress.env().FRONTEND_E_ISR_APPLICATION_DATE ?? '')
  : (import.meta.env.FRONTEND_E_ISR_APPLICATION_DATE ?? '')

export const HIDDEN_ERROR = 'HIDDEN_ERROR'

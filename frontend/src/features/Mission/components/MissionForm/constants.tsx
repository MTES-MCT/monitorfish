import { isCypress } from '@utils/isCypress'

import type { MissionActionFormValues } from './types'
import type { Undefine } from '@mtes-mct/monitor-ui'
import type { LegacyControlUnit } from 'domain/types/legacyControlUnit'

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
  controlQualityComments: undefined,
  controlUnits: [],
  emitsAis: undefined,
  emitsVms: undefined,
  facade: undefined,
  feedbackSheetRequired: undefined,
  gearInfractions: [],
  gearOnboard: [],
  id: undefined,
  isAdministrativeControl: undefined,
  isComplianceWithWaterRegulationsControl: undefined,
  isSafetyEquipmentAndStandardsComplianceControl: undefined,
  isSeafarersControl: undefined,
  isValid: false,
  latitude: undefined,
  licencesAndLogbookObservations: undefined,
  licencesMatchActivity: undefined,
  logbookInfractions: [],
  logbookMatchesActivity: undefined,
  longitude: undefined,
  numberOfVesselsFlownOver: undefined,
  otherComments: undefined,
  otherInfractions: [],
  portLocode: undefined,
  segments: [],
  seizureAndDiversion: undefined,
  seizureAndDiversionComments: undefined,
  separateStowageOfPreservedSpecies: undefined,
  speciesInfractions: [],
  speciesObservations: undefined,
  speciesOnboard: [],
  speciesSizeControlled: undefined,
  speciesWeightControlled: undefined,
  unitWithoutOmegaGauge: undefined,
  userTrigram: undefined,
  vesselId: undefined,
  vesselName: undefined,
  vesselTargeted: undefined
}

/**
 * List of PAM units identifiers:
 *  10141 PAM Gyptis
 *  10404 PAM Iris
 *  10121 PAM Jeanne Barret
 *  10345 PAM Osiris
 *  10080 PAM Themis
 */
export const PAMControlUnitIds = [10141, 10404, 10121, 10345, 10080]

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

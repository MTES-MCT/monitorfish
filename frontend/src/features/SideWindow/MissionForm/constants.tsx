import type { MissionActionFormValues } from './types'
import type { ControlUnit } from '../../../domain/types/controlUnit'
import type { Undefine } from '@mtes-mct/monitor-ui'

export const INITIAL_MISSION_CONTROL_UNIT: ControlUnit.ControlUnitDraft = {
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

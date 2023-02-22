import type { MissionActionFormValues, MissionFormValues } from './types'
import type { Undefine } from '@mtes-mct/monitor-ui'

export const INITIAL_MISSION_CONTROL_UNIT: MissionFormValues['controlUnits'][0] = {
  administration: undefined,
  contact: undefined,
  id: undefined,
  name: undefined,
  resources: undefined
}

export const MISSION_ACTION_FORM_VALUES_SKELETON: Undefine<MissionActionFormValues> = {
  actionDatetimeUtc: undefined,
  actionType: undefined,
  controlQualityComments: undefined,
  controlUnits: [],
  diversion: undefined,
  emitsAis: undefined,
  emitsVms: undefined,
  facade: undefined,
  feedbackSheetRequired: undefined,
  gearInfractions: [],
  gearOnboard: [],
  id: undefined,
  isFromPoseidon: undefined,
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
  portName: undefined,
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
  vesselTargeted: undefined,

  // TODO I had to add that.
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  vesselName: undefined
}

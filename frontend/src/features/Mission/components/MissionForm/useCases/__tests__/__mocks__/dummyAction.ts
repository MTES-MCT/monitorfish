import { MissionAction } from '@features/Mission/missionAction.types'

import MissionActionType = MissionAction.MissionActionType
import CompletionStatus = MissionAction.CompletionStatus

export const dummyAction = {
  actionDatetimeUtc: '2023-12-08T08:27:00Z',
  actionType: MissionActionType.SEA_CONTROL,
  completedBy: undefined,
  completion: CompletionStatus.COMPLETED,
  controlQualityComments: undefined,
  controlUnits: [],
  districtCode: 'AY',
  emitsAis: undefined,
  emitsVms: undefined,
  externalReferenceNumber: 'DONTSINK',
  facade: 'NAMO',
  faoAreas: ['27.8.b', '27.8.c'],
  flagState: 'FR',
  flightGoals: [],
  gearOnboard: [
    {
      comments: undefined,
      controlledMesh: undefined,
      declaredMesh: 70.0,
      gearCode: 'OTB',
      gearName: 'Chaluts de fond à panneaux',
      gearWasControlled: undefined,
      hasUncontrolledMesh: false
    }
  ],
  hasSomeGearsSeized: false,
  hasSomeSpeciesSeized: false,
  id: 123456,
  infractions: [],
  internalReferenceNumber: 'FAK000999999',
  ircs: 'CALLME',
  isAdministrativeControl: undefined,
  isComplianceWithWaterRegulationsControl: undefined,
  isFromPoseidon: false,
  isSafetyEquipmentAndStandardsComplianceControl: undefined,
  isSeafarersControl: undefined,
  isValid: true,
  latitude: 47.648401281163814,
  licencesAndLogbookObservations: undefined,
  licencesMatchActivity: undefined,
  logbookMatchesActivity: undefined,
  longitude: -4.281934312813745,
  missionId: 123,
  numberOfVesselsFlownOver: undefined,
  otherComments: undefined,
  portLocode: undefined,
  portName: undefined,
  segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
  seizureAndDiversion: false,
  seizureAndDiversionComments: undefined,
  separateStowageOfPreservedSpecies: undefined,
  speciesObservations: undefined,
  speciesOnboard: [
    {
      controlledWeight: undefined,
      declaredWeight: 471.2,
      nbFish: undefined,
      speciesCode: 'HKE',
      underSized: false
    },
    {
      controlledWeight: undefined,
      declaredWeight: 13.46,
      nbFish: undefined,
      speciesCode: 'BLI',
      underSized: false
    }
  ],
  speciesQuantitySeized: undefined,
  speciesSizeControlled: undefined,
  speciesWeightControlled: undefined,
  unitWithoutOmegaGauge: false,
  userTrigram: 'LT',
  vesselId: 1,
  vesselName: 'PHENOMENE',
  vesselTargeted: undefined
}

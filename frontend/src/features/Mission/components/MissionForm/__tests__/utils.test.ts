import { expect } from '@jest/globals'

import { MissionAction } from '../../../missionAction.types'
import { getMissionActionsToCreateUpdateOrDelete } from '../utils'

import MissionActionType = MissionAction.MissionActionType

describe('features/Mission/components/MissionForm/utils.getMissionActionsDataFromMissionActionsFormValues()', () => {
  it('Should delete a previous action delete from the list and create a new action', () => {
    // Given
    const missionId = 123
    const actionsFormValues = [
      {
        actionDatetimeUtc: '2023-12-08T08:27:00Z',
        actionType: MissionActionType.SEA_CONTROL,
        closedBy: undefined,
        controlQualityComments: undefined,
        controlUnits: [],
        districtCode: 'AY',
        emitsAis: undefined,
        emitsVms: undefined,
        externalReferenceNumber: 'DONTSINK',
        facade: 'NAMO',
        faoAreas: ['27.8.b', '27.8.c'],
        feedbackSheetRequired: false,
        flagState: 'FR',
        flightGoals: [],
        gearInfractions: [],
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
        logbookInfractions: [],
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        numberOfVesselsFlownOver: undefined,
        otherComments: undefined,
        otherInfractions: [],
        portLocode: undefined,
        segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: undefined,
        separateStowageOfPreservedSpecies: undefined,
        speciesInfractions: [],
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
        speciesSizeControlled: undefined,
        speciesWeightControlled: undefined,
        unitWithoutOmegaGauge: false,
        userTrigram: 'LT',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: undefined
      }
    ]
    const originalMissionActions = [
      {
        actionDatetimeUtc: '2023-12-08T08:27:00Z',
        actionType: MissionActionType.SEA_CONTROL,
        closedBy: undefined,
        controlQualityComments: undefined,
        controlUnits: [],
        districtCode: 'AY',
        emitsAis: undefined,
        emitsVms: undefined,
        externalReferenceNumber: 'DONTSINK',
        facade: 'NAMO',
        faoAreas: ['27.8.b', '27.8.c'],
        feedbackSheetRequired: false,
        flagState: 'FR',
        flightGoals: [],
        gearInfractions: [],
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
        id: 20,
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isAdministrativeControl: undefined,
        isComplianceWithWaterRegulationsControl: undefined,
        isFromPoseidon: false,
        isSafetyEquipmentAndStandardsComplianceControl: undefined,
        isSeafarersControl: undefined,
        latitude: 47.648401281163814,
        licencesAndLogbookObservations: undefined,
        licencesMatchActivity: undefined,
        logbookInfractions: [],
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        missionId: 43,
        numberOfVesselsFlownOver: undefined,
        otherComments: undefined,
        otherInfractions: [],
        portLocode: undefined,
        portName: undefined,
        segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: undefined,
        separateStowageOfPreservedSpecies: undefined,
        speciesInfractions: [],
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
        speciesSizeControlled: undefined,
        speciesWeightControlled: undefined,
        unitWithoutOmegaGauge: false,
        userTrigram: 'LT',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: undefined
      }
    ]

    // When
    const { createdOrUpdatedMissionActions, deletedMissionActionIds } = getMissionActionsToCreateUpdateOrDelete(
      missionId,
      actionsFormValues,
      originalMissionActions
    )

    // Then
    expect(deletedMissionActionIds).toHaveLength(1)
    expect(deletedMissionActionIds[0]).toEqual(20)
    expect(createdOrUpdatedMissionActions).toHaveLength(1)
    expect(createdOrUpdatedMissionActions[0]?.id).toEqual(undefined)
  })

  it('Should get deleted actions When the action is no more in the action form list', () => {
    // Given
    const missionId = 123
    const actionsFormValues = [
      {
        actionDatetimeUtc: '2023-12-08T08:27:00Z',
        actionType: MissionActionType.SEA_CONTROL,
        closedBy: undefined,
        controlQualityComments: undefined,
        controlUnits: [],
        districtCode: 'AY',
        emitsAis: undefined,
        emitsVms: undefined,
        externalReferenceNumber: 'DONTSINK',
        facade: 'NAMO',
        faoAreas: ['27.8.b', '27.8.c'],
        feedbackSheetRequired: false,
        flagState: 'FR',
        flightGoals: [],
        gearInfractions: [],
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
        id: 20,
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
        logbookInfractions: [],
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        missionId: 43,
        numberOfVesselsFlownOver: undefined,
        otherComments: undefined,
        otherInfractions: [],
        portLocode: undefined,
        portName: undefined,
        segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: undefined,
        separateStowageOfPreservedSpecies: undefined,
        speciesInfractions: [],
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
        speciesSizeControlled: undefined,
        speciesWeightControlled: undefined,
        unitWithoutOmegaGauge: false,
        userTrigram: 'LT',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: undefined
      }
    ]
    const originalMissionActions = [
      {
        actionDatetimeUtc: '2023-12-08T08:27:00Z',
        actionType: MissionActionType.SEA_CONTROL,
        closedBy: undefined,
        controlQualityComments: undefined,
        controlUnits: [],
        districtCode: 'AY',
        emitsAis: undefined,
        emitsVms: undefined,
        externalReferenceNumber: 'DONTSINK',
        facade: 'NAMO',
        faoAreas: ['27.8.b', '27.8.c'],
        feedbackSheetRequired: false,
        flagState: 'FR',
        flightGoals: [],
        gearInfractions: [],
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
        id: 20,
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isAdministrativeControl: undefined,
        isComplianceWithWaterRegulationsControl: undefined,
        isFromPoseidon: false,
        isSafetyEquipmentAndStandardsComplianceControl: undefined,
        isSeafarersControl: undefined,
        latitude: 47.648401281163814,
        licencesAndLogbookObservations: undefined,
        licencesMatchActivity: undefined,
        logbookInfractions: [],
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        missionId: 43,
        numberOfVesselsFlownOver: undefined,
        otherComments: undefined,
        otherInfractions: [],
        portLocode: undefined,
        portName: undefined,
        segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: undefined,
        separateStowageOfPreservedSpecies: undefined,
        speciesInfractions: [],
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
        speciesSizeControlled: undefined,
        speciesWeightControlled: undefined,
        unitWithoutOmegaGauge: false,
        userTrigram: 'LT',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: undefined
      }
    ]

    // When
    const { createdOrUpdatedMissionActions, deletedMissionActionIds } = getMissionActionsToCreateUpdateOrDelete(
      missionId,
      actionsFormValues,
      originalMissionActions
    )

    // Then
    expect(deletedMissionActionIds).toHaveLength(0)
    expect(createdOrUpdatedMissionActions).toHaveLength(1)
    expect(createdOrUpdatedMissionActions[0]?.id).toEqual(20)
  })
})

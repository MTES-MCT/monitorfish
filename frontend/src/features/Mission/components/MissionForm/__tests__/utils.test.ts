import { Mission } from '@features/Mission/mission.types'
import { expect } from '@jest/globals'

import { MissionAction } from '../../../missionAction.types'
import { getMissionActionsToCreateUpdateOrDelete, getMissionDataFromMissionFormValues } from '../utils'

import MissionActionType = MissionAction.MissionActionType
import CompletionStatus = MissionAction.CompletionStatus
import MissionType = Mission.MissionType
import MissionSource = Mission.MissionSource

describe('features/Mission/components/MissionForm/utils', () => {
  it('getMissionActionsToCreateUpdateOrDelete() Should delete a previous action delete from the list and create a new action', () => {
    // Given
    const missionId = 123
    const actionsFormValues = [
      {
        actionDatetimeUtc: '2023-12-08T08:27:00Z',
        actionType: MissionActionType.SEA_CONTROL,
        completedBy: undefined,
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
        completedBy: undefined,
        completion: CompletionStatus.TO_COMPLETE,
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
        speciesQuantitySeized: undefined,
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

  it('getMissionActionsToCreateUpdateOrDelete() Should get deleted actions When the action is no more in the action form list', () => {
    // Given
    const missionId = 123
    const actionsFormValues = [
      {
        actionDatetimeUtc: '2023-12-08T08:27:00Z',
        actionType: MissionActionType.SEA_CONTROL,
        completedBy: undefined,
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
        speciesQuantitySeized: undefined,
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
        completedBy: undefined,
        completion: CompletionStatus.TO_COMPLETE,
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
        speciesQuantitySeized: undefined,
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

  it('getMissionDataFromMissionFormValues() should keep the existing missionSource if previously set', () => {
    // Given
    const missionForm = {
      controlUnits: [
        {
          administration: 'DDTM',
          contact: undefined,
          id: 10499,
          isArchived: false,
          name: 'Cultures marines 56',
          resources: [
            {
              id: 314,
              name: 'Brezel - FAH 7185'
            }
          ]
        }
      ],
      endDateTimeUtc: '2023-12-31T23:30:00.000000Z',
      id: undefined,
      isGeometryComputedFromControls: true,
      isUnderJdp: true,
      isValid: true,
      missionSource: MissionSource.POSEIDON_CNSP,
      missionTypes: [MissionType.SEA],
      startDateTimeUtc: '2022-12-31T23:30:00.000000Z'
    }

    // When
    const result = getMissionDataFromMissionFormValues(missionForm)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isValid, ...missionFormWithoutIsValid } = missionForm

    // Then
    expect(result).toStrictEqual(missionFormWithoutIsValid)
  })
})

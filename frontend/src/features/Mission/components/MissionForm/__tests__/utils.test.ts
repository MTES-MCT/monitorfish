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
        actionEndDatetimeUtc: undefined,
        actionType: MissionActionType.SEA_CONTROL,
        completedBy: undefined,
        controlQualityComments: undefined,
        controlUnits: [],
        discardedSpecies: [],
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
            averageWireThickness: undefined,
            comments: undefined,
            controlledMesh: undefined,
            declaredMesh: 70.0,
            gearCode: 'OTB',
            gearMarkingIsCompliant: undefined,
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: undefined,
            hasUncontrolledMesh: false,
            wireType: undefined
          }
        ],
        hasSomeGearsSeized: false,
        hasSomeSpeciesSeized: false,
        infractions: [],
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isAdministrativeControl: undefined,
        isComplianceWithWaterRegulationsControl: undefined,
        isFromPoseidon: false,
        isGangwayDeployed: undefined,
        isINNControl: false,
        isLastHaul: false,
        isSafetyEquipmentAndStandardsComplianceControl: undefined,
        isSeafarersControl: undefined,
        isValid: true,
        latitude: 47.648401281163814,
        licencesAndLogbookObservations: undefined,
        licencesMatchActivity: undefined,
        logbookFilledPriorToControl: undefined,
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        numberOfVesselsFlownOver: undefined,
        observationsByUnit: undefined,
        otherComments: undefined,
        portLocode: undefined,
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
            rejectedWeight: undefined,
            speciesCode: 'HKE',
            underSized: false,
            underSizedWeight: undefined
          },
          {
            controlledWeight: undefined,
            declaredWeight: 13.46,
            nbFish: undefined,
            rejectedWeight: undefined,
            speciesCode: 'BLI',
            underSized: false,
            underSizedWeight: undefined
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
        actionEndDatetimeUtc: undefined,
        actionType: MissionActionType.SEA_CONTROL,
        approvedWeighingOperatorInformation: undefined,
        catchesWeighedAtLanding: undefined,
        completedBy: undefined,
        completion: CompletionStatus.TO_COMPLETE,
        controlQualityComments: undefined,
        controlUnits: [],
        cratesWeighingSamplingControl: undefined,
        discardedSpecies: [],
        districtCode: 'AY',
        emitsAis: undefined,
        emitsVms: undefined,
        externalReferenceNumber: 'DONTSINK',
        facade: 'NAMO',
        faoAreas: ['27.8.b', '27.8.c'],
        fishingLicencesMatchActivity: undefined,
        flagState: 'FR',
        flightGoals: [],
        gearOnboard: [
          {
            averageWireThickness: undefined,
            comments: undefined,
            controlledMesh: undefined,
            declaredMesh: 70.0,
            gearCode: 'OTB',
            gearMarkingIsCompliant: undefined,
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: undefined,
            hasUncontrolledMesh: false,
            wireType: undefined
          }
        ],
        hasSomeGearsSeized: false,
        hasSomeSpeciesSeized: false,
        holdControlledAfterUnloading: undefined,
        id: 20,
        infractions: [],
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isAdministrativeControl: undefined,
        isComplianceWithWaterRegulationsControl: undefined,
        isFromPoseidon: false,
        isGangwayDeployed: undefined,
        isINNControl: false,
        isLastHaul: false,
        isSafetyEquipmentAndStandardsComplianceControl: undefined,
        isSeafarersControl: undefined,
        latitude: 47.648401281163814,
        licencesAndLogbookObservations: undefined,
        licencesMatchActivity: undefined,
        logbookFilledPriorToControl: undefined,
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        minimumConservationReferenceSizeControlled: undefined,
        missionId: 43,
        numberOfVesselsFlownOver: undefined,
        observationsByUnit: undefined,
        onboardWeighingPermit: undefined,
        otherComments: undefined,
        portEntranceAndLandingAuthorized: undefined,
        portLocode: undefined,
        portName: undefined,
        propulsionEnginePowerControl: undefined,
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
            rejectedWeight: undefined,
            speciesCode: 'HKE',
            underSized: false,
            underSizedWeight: undefined
          },
          {
            controlledWeight: undefined,
            declaredWeight: 13.46,
            nbFish: undefined,
            rejectedWeight: undefined,
            speciesCode: 'BLI',
            underSized: false,
            underSizedWeight: undefined
          }
        ],
        speciesQuantitySeized: undefined,
        speciesSizeControlled: undefined,
        speciesWeightControlled: undefined,
        stowagePlanPresent: undefined,
        underSizedSeparateRecording: undefined,
        underSizedSeparateStowage: undefined,
        unitWithoutOmegaGauge: false,
        userTrigram: 'LT',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: undefined,
        vmsEmissionControlBeforeArrival: undefined,
        weighingCertificateAndSystemsValid: undefined
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
        actionEndDatetimeUtc: undefined,
        actionType: MissionActionType.SEA_CONTROL,
        completedBy: undefined,
        controlQualityComments: undefined,
        controlUnits: [],
        discardedSpecies: [],
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
            averageWireThickness: undefined,
            comments: undefined,
            controlledMesh: undefined,
            declaredMesh: 70.0,
            gearCode: 'OTB',
            gearMarkingIsCompliant: undefined,
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: undefined,
            hasUncontrolledMesh: false,
            wireType: undefined
          }
        ],
        hasSomeGearsSeized: false,
        hasSomeSpeciesSeized: false,
        id: 20,
        infractions: [],
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isAdministrativeControl: undefined,
        isComplianceWithWaterRegulationsControl: undefined,
        isFromPoseidon: false,
        isGangwayDeployed: undefined,
        isINNControl: false,
        isLastHaul: false,
        isSafetyEquipmentAndStandardsComplianceControl: undefined,
        isSeafarersControl: undefined,
        isValid: true,
        latitude: 47.648401281163814,
        licencesAndLogbookObservations: undefined,
        licencesMatchActivity: undefined,
        logbookFilledPriorToControl: undefined,
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        missionId: 43,
        numberOfVesselsFlownOver: undefined,
        observationsByUnit: undefined,
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
            rejectedWeight: undefined,
            speciesCode: 'HKE',
            underSized: false,
            underSizedWeight: undefined
          },
          {
            controlledWeight: undefined,
            declaredWeight: 13.46,
            nbFish: undefined,
            rejectedWeight: undefined,
            speciesCode: 'BLI',
            underSized: false,
            underSizedWeight: undefined
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
        actionEndDatetimeUtc: undefined,
        actionType: MissionActionType.SEA_CONTROL,
        approvedWeighingOperatorInformation: undefined,
        catchesWeighedAtLanding: undefined,
        completedBy: undefined,
        completion: CompletionStatus.TO_COMPLETE,
        controlQualityComments: undefined,
        controlUnits: [],
        cratesWeighingSamplingControl: undefined,
        discardedSpecies: [],
        districtCode: 'AY',
        emitsAis: undefined,
        emitsVms: undefined,
        externalReferenceNumber: 'DONTSINK',
        facade: 'NAMO',
        faoAreas: ['27.8.b', '27.8.c'],
        fishingLicencesMatchActivity: undefined,
        flagState: 'FR',
        flightGoals: [],
        gearOnboard: [
          {
            averageWireThickness: undefined,
            comments: undefined,
            controlledMesh: undefined,
            declaredMesh: 70.0,
            gearCode: 'OTB',
            gearMarkingIsCompliant: undefined,
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: undefined,
            hasUncontrolledMesh: false,
            wireType: undefined
          }
        ],
        hasSomeGearsSeized: false,
        hasSomeSpeciesSeized: false,
        holdControlledAfterUnloading: undefined,
        id: 20,
        infractions: [],
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isAdministrativeControl: undefined,
        isComplianceWithWaterRegulationsControl: undefined,
        isFromPoseidon: false,
        isGangwayDeployed: undefined,
        isINNControl: false,
        isLastHaul: false,
        isSafetyEquipmentAndStandardsComplianceControl: undefined,
        isSeafarersControl: undefined,
        latitude: 47.648401281163814,
        licencesAndLogbookObservations: undefined,
        licencesMatchActivity: undefined,
        logbookFilledPriorToControl: undefined,
        logbookMatchesActivity: undefined,
        longitude: -4.281934312813745,
        minimumConservationReferenceSizeControlled: undefined,
        missionId: 43,
        numberOfVesselsFlownOver: undefined,
        observationsByUnit: undefined,
        onboardWeighingPermit: undefined,
        otherComments: undefined,
        portEntranceAndLandingAuthorized: undefined,
        portLocode: undefined,
        portName: undefined,
        propulsionEnginePowerControl: undefined,
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
            rejectedWeight: undefined,
            speciesCode: 'HKE',
            underSized: false,
            underSizedWeight: undefined
          },
          {
            controlledWeight: undefined,
            declaredWeight: 13.46,
            nbFish: undefined,
            rejectedWeight: undefined,
            speciesCode: 'BLI',
            underSized: false,
            underSizedWeight: undefined
          }
        ],
        speciesQuantitySeized: undefined,
        speciesSizeControlled: undefined,
        speciesWeightControlled: undefined,
        stowagePlanPresent: undefined,
        underSizedSeparateRecording: undefined,
        underSizedSeparateStowage: undefined,
        unitWithoutOmegaGauge: false,
        userTrigram: 'LT',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: undefined,
        vmsEmissionControlBeforeArrival: undefined,
        weighingCertificateAndSystemsValid: undefined
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
              name: 'Brezel - FAH 7185',
              type: 'CAR'
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

import { FleetSegmentSchema } from '@features/FleetSegment/types'
import {
  ActiveVesselEmittingPositionSchema,
  ActivityOrigin,
  ActivityType,
  VesselIdentifier
} from '@features/Vessel/schemas/ActiveVesselSchema'
import { expect } from '@jest/globals'
import { parseOrReturn } from '@utils/parseOrReturn'

describe('utils/parseOrReturn()', () => {
  it('should return the original response and print an error', () => {
    const object = { dummy: true }

    const result = parseOrReturn(object, ActiveVesselEmittingPositionSchema, false)

    expect(result).toStrictEqual(object)
  })

  it('should return the original response and print an error with an array', () => {
    const object = { dummy: true }

    const result = parseOrReturn([object], ActiveVesselEmittingPositionSchema, true)

    expect(result).toStrictEqual([object])
  })

  it('should validate an active vessel with null coordinates successfully', () => {
    const vessel = {
      activityOrigin: ActivityOrigin.FROM_LOGBOOK,
      activityType: ActivityType.POSITION_BASED,
      alerts: [],
      beaconMalfunctionId: undefined,
      coordinates: null,
      course: undefined,
      dateTime: '2024-01-01T00:00:00Z',
      detectabilityRiskFactor: 0,
      flagState: 'FR',
      gearsArray: [],
      hasAlert: false,
      hasBeaconMalfunction: false,
      hasInfractionSuspicion: false,
      impactRiskFactor: 0,
      isAtPort: false,
      isFiltered: 0,
      lastPositionSentAt: 0,
      latitude: -128.0521,
      longitude: -256.0521,
      positionType: 'VMS',
      probabilityRiskFactor: 0,
      riskFactor: 0,
      segments: [],
      speciesArray: [],
      speciesOnboard: [],
      vesselFeatureId: 'test-vessel',
      vesselGroups: [],
      vesselIdentifier: VesselIdentifier.IRCS
    }

    const result = parseOrReturn(vessel, ActiveVesselEmittingPositionSchema, false)

    expect(result).toStrictEqual(vessel)
  })

  it('should validate the type successfully', () => {
    const segment = {
      faoAreas: [],
      gears: [],
      impactRiskFactor: 2.0,
      mainScipSpeciesType: undefined,
      maxMesh: undefined,
      minMesh: undefined,
      minShareOfTargetSpecies: undefined,
      priority: 0,
      segment: '',
      segmentName: '',
      targetSpecies: [],
      vesselTypes: [],
      year: 2021
    }

    const result = parseOrReturn(segment, FleetSegmentSchema, false)

    expect(result).toStrictEqual(segment)
  })
})

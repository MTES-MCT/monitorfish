import { describe, expect, it } from '@jest/globals'

import { ActivityOrigin, ActivityType, VesselIdentifier } from '../schemas/ActiveVesselSchema'
import { buildFeature, getLastControlDateTime } from '../utils'

describe('utils/getLastControlDateTime()', () => {
  it('should return undefined when both dates are undefined', () => {
    const result = getLastControlDateTime(undefined, undefined)

    expect(result).toBeUndefined()
  })

  it('should return undefined when both dates are null', () => {
    const result = getLastControlDateTime(undefined, undefined)

    expect(result).toBeUndefined()
  })

  it('should return lastControlAtQuayDateTime when only quay date is provided', () => {
    const quayDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(undefined, quayDate)

    expect(result).toBe(quayDate)
  })

  it('should return lastControlAtSeaDateTime when only sea date is provided', () => {
    const seaDate = '2024-01-10T14:45:00Z'

    const result = getLastControlDateTime(seaDate, undefined)

    expect(result).toBe(seaDate)
  })

  it('should return the most recent date when both dates are provided and quay is more recent', () => {
    const seaDate = '2024-01-10T14:45:00Z'
    const quayDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(seaDate, quayDate)

    expect(result).toBe(quayDate)
  })

  it('should return the most recent date when both dates are provided and sea is more recent', () => {
    const seaDate = '2024-01-20T14:45:00Z'
    const quayDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(seaDate, quayDate)

    expect(result).toBe(seaDate)
  })

  it('should return the same date when both dates are identical', () => {
    const sameDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(sameDate, sameDate)

    expect(result).toBe(sameDate)
  })

  it('should handle empty strings as falsy values', () => {
    const result = getLastControlDateTime('', '')

    expect(result).toBeUndefined()
  })

  it('should return valid date when one is empty string and other is valid', () => {
    const validDate = '2024-01-15T10:30:00Z'

    const resultWithEmptyQuay = getLastControlDateTime(validDate, '')
    const resultWithEmptySea = getLastControlDateTime('', validDate)

    expect(resultWithEmptyQuay).toBe(validDate)
    expect(resultWithEmptySea).toBe(validDate)
  })
})

describe('utils/buildFeature()', () => {
  const vesselGroupDisplayed = {
    groupColor: [0, 0, 0] as [number, number, number],
    groupsDisplayed: [],
    numberOfGroupsHidden: 0
  }

  it('should return undefined when vessel has null coordinates', () => {
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
      hasCurrentTripInfractionSuspicion: false,
      hasInfractionSuspicion: false,
      impactRiskFactor: 0,
      isAtPort: false,
      isFiltered: 0,
      landingPortLocode: undefined,
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
    } as any

    const result = buildFeature(vessel, vesselGroupDisplayed)

    expect(result).toBeUndefined()
  })
})

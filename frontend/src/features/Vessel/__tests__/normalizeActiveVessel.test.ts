import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { describe, expect, it } from '@jest/globals'
import { transform } from 'ol/proj'

import { normalizeActiveVessel } from '../normalizeActiveVessel'
import { ActiveVesselApiSchema, ActiveVesselSchema } from '../schemas/ActiveVesselSchema'

import type { Vessel } from '../Vessel.types'

const API_VESSEL_EMITTING_POSITION: Vessel.ActiveVesselFromApi = {
  activityOrigin: 'FROM_LOGBOOK' as Vessel.ActiveVesselFromApi['activityOrigin'],
  activityType: 'POSITION_BASED',
  alerts: ['THREE_MILES_TRAWLING_ALERT'],
  beaconMalfunctionId: 12,
  dateTime: '2026-11-10T10:00:00Z',
  detectabilityRiskFactor: 2,
  emitsPositions: true,
  externalReferenceNumber: undefined,
  flagState: 'FR',
  gearsArray: [],
  hasCurrentTripInfractionSuspicion: false,
  hasInfractionSuspicion: false,
  impactRiskFactor: 2,
  internalReferenceNumber: 'FR224226850',
  ircs: 'FQ7058',
  isAtPort: false,
  latitude: 47.5,
  longitude: -3.5,
  positionType: 'VMS',
  probabilityRiskFactor: 2,
  riskFactor: 2,
  segments: [],
  speciesArray: [],
  speciesOnboard: [],
  vesselGroups: [],
  vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER' as Vessel.ActiveVesselFromApi['vesselIdentifier']
}

const API_VESSEL_EMITTING_LOGBOOK: Vessel.ActiveVesselFromApi = {
  activityOrigin: 'FROM_LOGBOOK' as Vessel.ActiveVesselFromApi['activityOrigin'],
  activityType: 'LOGBOOK_BASED',
  detectabilityRiskFactor: 2,
  emitsPositions: false,
  externalReferenceNumber: 'SB125334',
  flagState: 'FR',
  gearsArray: [],
  hasCurrentTripInfractionSuspicion: false,
  hasInfractionSuspicion: false,
  impactRiskFactor: 2,
  internalReferenceNumber: 'FR263418260',
  isAtPort: false,
  probabilityRiskFactor: 2,
  riskFactor: 2,
  segments: [],
  speciesArray: [],
  speciesOnboard: [],
  vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER' as Vessel.ActiveVesselFromApi['vesselIdentifier']
}

describe('features/Vessel/normalizeActiveVessel()', () => {
  it('Should rebuild the properties of a vessel emitting positions not sent by the API', () => {
    expect(ActiveVesselApiSchema.safeParse(API_VESSEL_EMITTING_POSITION).success).toBe(true)

    const result = normalizeActiveVessel(API_VESSEL_EMITTING_POSITION, 7)

    expect(ActiveVesselSchema.safeParse(result).success).toBe(true)
    expect(result).toMatchObject({
      hasAlert: true,
      hasBeaconMalfunction: true,
      id: 7,
      isFiltered: 0,
      lastPositionSentAt: Date.parse('2026-11-10T10:00:00Z'),
      vesselFeatureId: 'VESSELS_POINTS:FR224226850/FQ7058/UNKNOWN'
    })
    const expectedCoordinates = transform([-3.5, 47.5], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    expect((result as Vessel.ActiveVesselEmittingPosition).coordinates?.[0]).toBeCloseTo(expectedCoordinates[0]!, 6)
    expect((result as Vessel.ActiveVesselEmittingPosition).coordinates?.[1]).toBeCloseTo(expectedCoordinates[1]!, 6)
  })

  it('Should not have alert nor beacon malfunction flags when there is none', () => {
    const result = normalizeActiveVessel(
      { ...API_VESSEL_EMITTING_POSITION, alerts: [], beaconMalfunctionId: undefined },
      0
    ) as Vessel.ActiveVesselEmittingPosition

    expect(result.hasAlert).toBe(false)
    expect(result.hasBeaconMalfunction).toBe(false)
  })

  it('Should not have coordinates when the position is out of bounds, as the API did', () => {
    const result = normalizeActiveVessel(
      { ...API_VESSEL_EMITTING_POSITION, latitude: 91 },
      0
    ) as Vessel.ActiveVesselEmittingPosition

    expect(result.coordinates).toBeNull()
  })

  it('Should keep the index of a vessel in its fixed vessel group sent by the API', () => {
    const result = normalizeActiveVessel({ ...API_VESSEL_EMITTING_POSITION, id: 3 }, 0)

    expect(result.id).toBe(3)
  })

  it('Should rebuild the properties of a vessel emitting logbook not sent by the API', () => {
    expect(ActiveVesselApiSchema.safeParse(API_VESSEL_EMITTING_LOGBOOK).success).toBe(true)

    const result = normalizeActiveVessel(API_VESSEL_EMITTING_LOGBOOK, 2)

    expect(ActiveVesselSchema.safeParse(result).success).toBe(true)
    expect(result).toMatchObject({
      id: 2,
      isFiltered: 0,
      vesselFeatureId: 'VESSELS:FR263418260/UNKNOWN/SB125334'
    })
  })
})

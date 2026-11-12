import { describe, expect, it } from '@jest/globals'

import { applyActiveVesselsChanges, getActiveVesselsFingerprint } from '../applyActiveVesselsChanges'

import type { Vessel } from '../Vessel.types'

const VESSEL_EMITTING_POSITIONS = {
  activityOrigin: 'FROM_LOGBOOK',
  activityType: 'POSITION_BASED',
  alerts: [],
  coordinates: [-389618.2, 6024873.1],
  dateTime: '2026-11-11T10:00:00Z',
  detectabilityRiskFactor: 2,
  emitsPositions: true,
  flagState: 'FR',
  gearsArray: ['OTB'],
  hasAlert: false,
  hasBeaconMalfunction: false,
  hasCurrentTripInfractionSuspicion: false,
  hasInfractionSuspicion: false,
  impactRiskFactor: 2,
  internalReferenceNumber: 'FR224226850',
  ircs: 'FQ7058',
  isAtPort: false,
  isFiltered: 0,
  lastPositionSentAt: Date.parse('2026-11-11T10:00:00Z'),
  latitude: 47.5,
  longitude: -3.5,
  positionType: 'VMS',
  probabilityRiskFactor: 2,
  riskFactor: 2,
  segments: [],
  speciesArray: [],
  speciesOnboard: [],
  speed: 8,
  vesselFeatureId: 'VESSELS_POINTS:FR224226850/FQ7058/UNKNOWN',
  vesselGroups: [],
  vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER'
} as unknown as Vessel.ActiveVesselEmittingPosition

const VESSEL_EMITTING_LOGBOOK = {
  activityOrigin: 'FROM_LOGBOOK',
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
  isFiltered: 0,
  probabilityRiskFactor: 2,
  riskFactor: 2,
  segments: [],
  speciesArray: [],
  speciesOnboard: [],
  vesselFeatureId: 'VESSELS:FR263418260/UNKNOWN/SB125334',
  vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER'
} as unknown as Vessel.ActiveVessel

const CURRENT_VESSELS: Vessel.ActiveVessel[] = [VESSEL_EMITTING_POSITIONS, VESSEL_EMITTING_LOGBOOK]

function getChanges(
  vessels: Vessel.ActiveVessel[],
  changes: Partial<Vessel.ActiveVesselsChanges>
): Vessel.ActiveVesselsChanges {
  return {
    activeVesselsCount: vessels.length,
    asOf: 'abc.456',
    fingerprint: getActiveVesselsFingerprint(vessels.map(vessel => vessel.vesselFeatureId)),
    isFull: false,
    positions: [],
    removedVesselFeatureIds: [],
    vesselGroupIdsByVesselFeatureId: {},
    vesselGroups: [],
    vessels: [],
    ...changes
  }
}

describe('features/Vessel/applyActiveVesselsChanges()', () => {
  it('getActiveVesselsFingerprint() Should compute the same fingerprint as the backend', () => {
    // See `ActiveVesselsChangeTrackerUTests`
    expect(
      getActiveVesselsFingerprint(['VESSELS_POINTS:FR224226850/FQ7058/UNKNOWN', 'VESSELS:FR263418260/UNKNOWN/SB125334'])
    ).toBe(2497665112)
    expect(getActiveVesselsFingerprint([])).toBe(2166136261)
  })

  it('Should replace all the vessels with a full response', () => {
    const result = applyActiveVesselsChanges(
      CURRENT_VESSELS,
      getChanges([VESSEL_EMITTING_LOGBOOK], { isFull: true, vessels: [VESSEL_EMITTING_LOGBOOK] })
    )

    expect(result.isConsistent).toBe(true)
    expect(result.vessels).toEqual([VESSEL_EMITTING_LOGBOOK])
  })

  it('Should only update the position of a vessel of which only the position changed', () => {
    const result = applyActiveVesselsChanges(
      CURRENT_VESSELS,
      getChanges(CURRENT_VESSELS, {
        positions: [
          {
            coordinates: [-378486.9, 6041358.6],
            dateTime: '2026-11-11T11:00:00Z',
            isAtPort: true,
            lastPositionSentAt: Date.parse('2026-11-11T11:00:00Z'),
            latitude: 47.6,
            longitude: -3.4,
            positionType: 'VMS',
            vesselFeatureId: VESSEL_EMITTING_POSITIONS.vesselFeatureId
          }
        ]
      })
    )

    expect(result.isConsistent).toBe(true)
    expect(result.vessels).toHaveLength(2)
    expect(result.vessels[0]).toEqual({
      ...VESSEL_EMITTING_POSITIONS,
      coordinates: [-378486.9, 6041358.6],
      dateTime: '2026-11-11T11:00:00Z',
      isAtPort: true,
      lastPositionSentAt: Date.parse('2026-11-11T11:00:00Z'),
      latitude: 47.6,
      longitude: -3.4,
      // Not sent anymore: not known anymore
      speed: undefined
    })
    expect(result.vessels[1]).toBe(VESSEL_EMITTING_LOGBOOK)
  })

  it('Should add, replace and remove the changed vessels', () => {
    const updatedVessel = { ...VESSEL_EMITTING_POSITIONS, hasInfractionSuspicion: true }
    const addedVessel = {
      ...VESSEL_EMITTING_POSITIONS,
      internalReferenceNumber: 'FR000000003',
      vesselFeatureId: 'VESSELS_POINTS:FR000000003/FQ7058/UNKNOWN'
    }
    const nextVessels = [updatedVessel, addedVessel]

    const result = applyActiveVesselsChanges(
      CURRENT_VESSELS,
      getChanges(nextVessels, {
        removedVesselFeatureIds: [VESSEL_EMITTING_LOGBOOK.vesselFeatureId],
        vessels: [updatedVessel, addedVessel]
      })
    )

    expect(result.isConsistent).toBe(true)
    expect(result.vessels).toEqual([updatedVessel, addedVessel])
  })

  it('Should update the vessel groups of all the vessels', () => {
    const group = { color: '#ffffff', id: 1, isPriorityGroup: false, name: 'Chalutiers' }
    const vesselInGroup = { ...VESSEL_EMITTING_POSITIONS, vesselGroups: [{ ...group, id: 2, name: 'Old group' }] }

    const result = applyActiveVesselsChanges(
      [vesselInGroup, VESSEL_EMITTING_LOGBOOK],
      getChanges(CURRENT_VESSELS, {
        vesselGroupIdsByVesselFeatureId: { [VESSEL_EMITTING_POSITIONS.vesselFeatureId]: [1] },
        vesselGroups: [group]
      })
    )

    expect((result.vessels[0] as Vessel.ActiveVesselEmittingPosition).vesselGroups).toEqual([group])

    const resultWithoutGroup = applyActiveVesselsChanges(
      [vesselInGroup, VESSEL_EMITTING_LOGBOOK],
      getChanges(CURRENT_VESSELS, {})
    )
    expect((resultWithoutGroup.vessels[0] as Vessel.ActiveVesselEmittingPosition).vesselGroups).toEqual([])
  })

  it('Should not be consistent When the vessels differ from the backend ones', () => {
    // A vessel missed by the client
    const missedVessel = { ...VESSEL_EMITTING_LOGBOOK, vesselFeatureId: 'VESSELS:FR000000004/UNKNOWN/UNKNOWN' }
    expect(
      applyActiveVesselsChanges(CURRENT_VESSELS, getChanges([...CURRENT_VESSELS, missedVessel], {})).isConsistent
    ).toBe(false)

    // A position of an unknown vessel
    expect(
      applyActiveVesselsChanges(
        [VESSEL_EMITTING_LOGBOOK],
        getChanges(CURRENT_VESSELS, {
          positions: [
            {
              coordinates: null,
              dateTime: '2026-11-11T11:00:00Z',
              isAtPort: false,
              lastPositionSentAt: 0,
              latitude: 47.6,
              longitude: -3.4,
              positionType: 'VMS',
              vesselFeatureId: VESSEL_EMITTING_POSITIONS.vesselFeatureId
            }
          ]
        })
      ).isConsistent
    ).toBe(false)
  })
})

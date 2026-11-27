import { describe, expect, it } from '@jest/globals'

import { ActivityType, VesselIdentifier } from '../../Vessel/schemas/ActiveVesselSchema'
import { getReplayedVessel, isReplayedVessel } from '../replayedVessel'

const REPLAYED_DATE_TIME = '2026-11-20T02:00:00.000Z'

describe('PositionReplay/replayedVessel', () => {
  it('getReplayedVessel() Should keep the identity and position, without any current-only data', () => {
    const replayedVessel = getReplayedVessel({
      coordinates: [1, 2],
      dateTime: REPLAYED_DATE_TIME,
      flagState: 'FR',
      internalReferenceNumber: 'FR123',
      latitude: 48,
      longitude: -4,
      positionType: 'VMS',
      vesselFeatureId: 'VESSELS_POINTS:FR123/UNKNOWN/UNKNOWN',
      vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      vesselName: 'NAVIRE'
    })

    expect(replayedVessel).toMatchObject({
      activityType: ActivityType.POSITION_BASED,
      flagState: 'FR',
      internalReferenceNumber: 'FR123',
      lastPositionSentAt: new Date(REPLAYED_DATE_TIME).valueOf(),
      latitude: 48,
      vesselName: 'NAVIRE'
    })
    expect(replayedVessel).not.toHaveProperty('riskFactor')
    expect(replayedVessel).not.toHaveProperty('segments')
    expect(isReplayedVessel(replayedVessel)).toBe(true)
  })

  it('getReplayedVessel() Should fall back to an undefined flag state', () => {
    const replayedVessel = getReplayedVessel({
      dateTime: REPLAYED_DATE_TIME,
      latitude: 48,
      longitude: -4,
      positionType: 'VMS',
      vesselFeatureId: 'VESSELS_POINTS:UNKNOWN/IRCS/UNKNOWN',
      vesselIdentifier: VesselIdentifier.IRCS
    })

    expect(replayedVessel.flagState).toEqual('UNDEFINED')
    expect(replayedVessel.coordinates).toBeNull()
  })
})

import { describe, expect, it } from '@jest/globals'

import { VesselTrackDepth } from '../../Vessel/types/vesselTrackDepth'
import {
  getLastVMSPositionOfTrack,
  getReplayedTrackRequest,
  getSelectedTrackDepth,
  getTrackRequestEndingAt,
  isTrackDepthAvailable
} from '../track'

import type { Vessel } from '../../Vessel/Vessel.types'

const REPLAYED_DATE_TIME = '2026-11-20T02:00:00.000Z'

const getPosition = (dateTime: string, positionType: string, speed: number) =>
  ({ course: 90, dateTime, latitude: 48, longitude: -4, positionType, speed }) as Vessel.VesselPosition

describe('PositionReplay/track', () => {
  it('getReplayedTrackRequest() Should return the 12 hours ending at the replayed date', () => {
    const trackRequest = getReplayedTrackRequest(REPLAYED_DATE_TIME)

    expect(trackRequest).toEqual({
      afterDateTime: new Date('2026-11-19T14:00:00.000Z'),
      beforeDateTime: new Date(REPLAYED_DATE_TIME),
      trackDepth: VesselTrackDepth.CUSTOM
    })
  })

  it('getSelectedTrackDepth() Should find back the predefined track depth ending at the replayed date', () => {
    const trackRequest = getTrackRequestEndingAt(VesselTrackDepth.ONE_DAY, REPLAYED_DATE_TIME)

    expect(getSelectedTrackDepth(trackRequest, REPLAYED_DATE_TIME)).toEqual(VesselTrackDepth.ONE_DAY)
  })

  it('getSelectedTrackDepth() Should keep a custom track depth When the dates do not match a predefined one', () => {
    const trackRequest = getTrackRequestEndingAt(VesselTrackDepth.ONE_DAY, '2026-11-20T01:00:00.000Z')

    expect(getSelectedTrackDepth(trackRequest, REPLAYED_DATE_TIME)).toEqual(VesselTrackDepth.CUSTOM)
  })

  it('getSelectedTrackDepth() Should keep the track depth When positions are not replayed', () => {
    const trackRequest = getTrackRequestEndingAt(VesselTrackDepth.ONE_DAY, undefined)

    expect(getSelectedTrackDepth(trackRequest, undefined)).toEqual(VesselTrackDepth.ONE_DAY)
  })

  it('getReplayedTrackRequest() Should return undefined When no date is replayed', () => {
    expect(getReplayedTrackRequest(undefined)).toBeUndefined()
  })

  it('getTrackRequestEndingAt() Should end the track depth at the replayed date When replaying', () => {
    expect(getTrackRequestEndingAt(VesselTrackDepth.THREE_DAYS, REPLAYED_DATE_TIME)).toEqual({
      afterDateTime: new Date('2026-11-17T02:00:00.000Z'),
      beforeDateTime: new Date(REPLAYED_DATE_TIME),
      trackDepth: VesselTrackDepth.CUSTOM
    })
  })

  it('getTrackRequestEndingAt() Should keep the track depth When not replaying', () => {
    expect(getTrackRequestEndingAt(VesselTrackDepth.THREE_DAYS, undefined)).toEqual({
      afterDateTime: null,
      beforeDateTime: null,
      trackDepth: VesselTrackDepth.THREE_DAYS
    })
  })

  it('isTrackDepthAvailable() Should exclude the last departure When replaying', () => {
    expect(isTrackDepthAvailable(VesselTrackDepth.LAST_DEPARTURE, true)).toBe(false)
    expect(isTrackDepthAvailable(VesselTrackDepth.THREE_DAYS, true)).toBe(true)
    expect(isTrackDepthAvailable(VesselTrackDepth.LAST_DEPARTURE, false)).toBe(true)
  })

  it('getLastVMSPositionOfTrack() Should return the last VMS position and the period between the two last ones', () => {
    const lastPosition = getLastVMSPositionOfTrack([
      getPosition('2026-11-20T01:00:00.000Z', 'VMS', 8),
      getPosition('2026-11-20T01:50:00.000Z', 'AIS', 4),
      getPosition('2026-11-20T00:00:00.000Z', 'VMS', 6)
    ])

    expect(lastPosition).toEqual({
      course: 90,
      dateTime: '2026-11-20T01:00:00.000Z',
      emissionPeriod: 3600,
      latitude: 48,
      longitude: -4,
      speed: 8
    })
  })

  it('getLastVMSPositionOfTrack() Should return no position When there is no VMS position', () => {
    expect(getLastVMSPositionOfTrack(null).dateTime).toBeUndefined()
  })
})

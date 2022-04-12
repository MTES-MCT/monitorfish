/*

import { getNextVesselTrackDepthObject, VesselTrackDepth } from '../../entities/vesselTrackDepth'

describe('showVesselTrack', () => {
  it('getNextVesselTrackDepthObject Should return the track depth request When it is not a date range', () => {
    // Given
    const trackRequest = {
      trackDepth: VesselTrackDepth.TWELVE_HOURS,
      beforeDateTime: null,
      afterDateTime: null
    }

    // When
    const {
        nextTrackRequest,
        isDefaultTrackDepth
      } = getNextVesselTrackDepthObject(trackRequest, VesselTrackDepth.TWELVE_HOURS)

    // Then
    expect(nextTrackRequest).toEqual(trackRequest)
    expect(isDefaultTrackDepth).toEqual(false)
  })

  it('getNextVesselTrackDepthObject Should return the track depth request When it is a date range', () => {
    // Given
    const date = new Date('2022-04-11T15:25:50.062Z')

    const trackRequest = {
      trackDepth: VesselTrackDepth.CUSTOM,
      beforeDateTime: date,
      afterDateTime: date
    }

    // When
    const {
      nextTrackRequest,
      isDefaultTrackDepth
    } = getNextVesselTrackDepthObject(trackRequest, VesselTrackDepth.TWELVE_HOURS)

    // Then
    expect(nextTrackRequest.afterDateTime).toEqual(new Date('2022-04-11T00:00:00.062Z'))
    expect(nextTrackRequest.beforeDateTime).toEqual(new Date('2022-04-11T23:59:59.062Z'))
    expect(isDefaultTrackDepth).toEqual(false)
  })

  it('getNextVesselTrackDepthObject Should return the default track depth request When there is no custom track depth', () => {
    // Given
    const trackRequest = null

    // When
    const {
      nextTrackRequest,
      isDefaultTrackDepth
    } = getNextVesselTrackDepthObject(trackRequest, VesselTrackDepth.TWELVE_HOURS)

    // Then
    expect(nextTrackRequest.trackDepth).toEqual(VesselTrackDepth.TWELVE_HOURS)
    expect(nextTrackRequest.afterDateTime).toEqual(null)
    expect(nextTrackRequest.beforeDateTime).toEqual(null)
    expect(isDefaultTrackDepth).toEqual(true)
  })
})
*/

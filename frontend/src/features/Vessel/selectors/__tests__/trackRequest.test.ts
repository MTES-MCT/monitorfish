import { PositionReplayStatus } from '@features/PositionReplay/slice'
import { describe, expect, it } from '@jest/globals'

import { VesselTrackDepth } from '../../types/vesselTrackDepth'
import { selectDefaultTrackRequest, selectSelectedVesselTrackRequest } from '../trackRequest'

import type { MainRootState } from '@store'

const CUSTOM_TRACK_REQUEST = {
  afterDateTime: new Date('2026-11-01T00:00:00.000Z'),
  beforeDateTime: new Date('2026-11-02T00:00:00.000Z'),
  trackDepth: VesselTrackDepth.CUSTOM
}
const REPLAYED_TRACK_REQUEST = {
  afterDateTime: new Date('2026-11-19T14:00:00.000Z'),
  beforeDateTime: new Date('2026-11-20T02:00:00.000Z'),
  trackDepth: VesselTrackDepth.CUSTOM
}
const TWELVE_HOURS_TRACK_REQUEST = {
  afterDateTime: null,
  beforeDateTime: null,
  trackDepth: VesselTrackDepth.TWELVE_HOURS
}

const getState = ({ isReplaying }: { isReplaying: boolean }) =>
  ({
    map: { defaultVesselTrackDepth: VesselTrackDepth.TWELVE_HOURS },
    positionReplay: isReplaying
      ? { dateTime: '2026-11-20T02:00:00.000Z', status: PositionReplayStatus.REPLAYING }
      : { status: PositionReplayStatus.OFF },
    vessel: { selectedVesselTrackRequest: CUSTOM_TRACK_REQUEST }
  }) as unknown as MainRootState

describe('Vessel/selectors/trackRequest', () => {
  it('selectDefaultTrackRequest() Should use the default track depth When positions are not replayed', () => {
    expect(selectDefaultTrackRequest(getState({ isReplaying: false }))).toEqual(TWELVE_HOURS_TRACK_REQUEST)
  })

  it('selectDefaultTrackRequest() Should end at the replayed date When positions are replayed', () => {
    expect(selectDefaultTrackRequest(getState({ isReplaying: true }))).toEqual(REPLAYED_TRACK_REQUEST)
  })

  it('selectSelectedVesselTrackRequest() Should use the user track request When positions are not replayed', () => {
    expect(selectSelectedVesselTrackRequest(getState({ isReplaying: false }))).toEqual(CUSTOM_TRACK_REQUEST)
  })

  it('selectSelectedVesselTrackRequest() Should end at the replayed date When positions are replayed', () => {
    expect(selectSelectedVesselTrackRequest(getState({ isReplaying: true }))).toEqual(REPLAYED_TRACK_REQUEST)
  })
})

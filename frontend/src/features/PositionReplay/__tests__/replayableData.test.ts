import { describe, expect, it } from '@jest/globals'

import { DataKind, isDataAvailableForVessel, selectIsDataAvailablePredicate } from '../replayableData'
import { PositionReplayStatus } from '../slice'

import type { MainRootState } from '@store'

const getIsDataAvailable = (status: PositionReplayStatus) =>
  selectIsDataAvailablePredicate({ positionReplay: { status } } as unknown as MainRootState)

const HISTORIZED_DATA_KINDS = [
  DataKind.LOGBOOK,
  DataKind.POSITIONS,
  DataKind.PRODUCER_ORGANIZATIONS,
  DataKind.VESSEL_IDENTITY
]

describe('PositionReplay/replayableData', () => {
  it.each(Object.values(DataKind))('%s Should be available When not replaying', dataKind => {
    expect(getIsDataAvailable(PositionReplayStatus.OFF)(dataKind)).toBe(true)
  })

  it('Should only keep the historized data When replaying', () => {
    const isDataAvailable = getIsDataAvailable(PositionReplayStatus.PICKING_DATE)

    expect(Object.values(DataKind).filter(isDataAvailable)).toEqual(HISTORIZED_DATA_KINDS)
  })

  it('Should return the same predicate between calls, to be used as a selector', () => {
    expect(getIsDataAvailable(PositionReplayStatus.REPLAYING)).toBe(
      getIsDataAvailable(PositionReplayStatus.PICKING_DATE)
    )
  })

  it('isDataAvailableForVessel() Should only keep the historized data of a replayed vessel', () => {
    expect(isDataAvailableForVessel({ isReplayed: true }, DataKind.FLEET_SEGMENTS)).toBe(false)
    expect(isDataAvailableForVessel({ isReplayed: true }, DataKind.VESSEL_IDENTITY)).toBe(true)
    expect(isDataAvailableForVessel({ isReplayed: false }, DataKind.FLEET_SEGMENTS)).toBe(true)
    expect(isDataAvailableForVessel({}, DataKind.FLEET_SEGMENTS)).toBe(true)
  })
})

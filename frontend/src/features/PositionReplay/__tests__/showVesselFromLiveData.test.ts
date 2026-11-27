import { describe, expect, it } from '@jest/globals'

import { liveVesselConfirmationActions } from '../liveVesselConfirmationSlice'
import { PositionReplayStatus } from '../slice'
import { showVesselFromLiveData } from '../useCases/showVesselFromLiveData'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainRootState } from '@store'

const VESSEL_IDENTITY = { internalReferenceNumber: 'FR123', vesselName: 'NAVIRE' } as Vessel.VesselIdentity

const run = (status: PositionReplayStatus) => {
  const dispatch = jest.fn()
  const getState = () => ({ positionReplay: { status } }) as unknown as MainRootState

  showVesselFromLiveData(VESSEL_IDENTITY)(dispatch as any, getState, undefined)

  return dispatch.mock.calls.map(([action]) => action)
}

describe('PositionReplay/useCases/showVesselFromLiveData()', () => {
  it('Should show the vessel When not replaying', () => {
    const [dispatched] = run(PositionReplayStatus.OFF)

    expect(typeof dispatched).toBe('function')
  })

  it('Should ask whether to quit the replay When replaying', () => {
    expect(run(PositionReplayStatus.REPLAYING)).toEqual([liveVesselConfirmationActions.ask(VESSEL_IDENTITY)])
  })
})

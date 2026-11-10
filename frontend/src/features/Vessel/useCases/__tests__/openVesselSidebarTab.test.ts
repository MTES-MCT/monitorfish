import { getVesselLogbook } from '@features/Logbook/useCases/getVesselLogbook'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'
import { beforeEach, describe, expect, it } from '@jest/globals'

import { openVesselSidebarTab } from '../openVesselSidebarTab'

jest.mock('@features/Logbook/useCases/getVesselLogbook', () => ({
  getVesselLogbook: jest.fn(() => ({ type: 'getVesselLogbook' }))
}))
jest.mock('@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays', () => ({
  displayLogbookMessageOverlays: jest.fn(() => ({ type: 'displayLogbookMessageOverlays' }))
}))

const getVesselLogbookMock = getVesselLogbook as jest.Mock

const SELECTED_VESSEL = {
  internalReferenceNumber: 'FRA000123456',
  vesselId: 123,
  vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER
}
const OTHER_VESSEL = {
  internalReferenceNumber: 'FRA000999999',
  vesselId: 999,
  vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER
}

const runOpenFishingTab = (logbookVesselIdentity: object | undefined) => {
  const dispatch = jest.fn((action: any) => (typeof action === 'function' ? action(dispatch, getState) : action))
  const getState = () => ({
    fishingActivities: { vesselIdentity: logbookVesselIdentity },
    vessel: { selectedVesselIdentity: SELECTED_VESSEL }
  })

  return openVesselSidebarTab(VesselSidebarTab.VOYAGES)(dispatch, getState)
}

describe('openVesselSidebarTab()', () => {
  beforeEach(() => {
    getVesselLogbookMock.mockClear()
  })

  it('Should not fetch again the logbook of the selected vessel when opening the fishing tab', async () => {
    await runOpenFishingTab(SELECTED_VESSEL)

    expect(getVesselLogbookMock).not.toHaveBeenCalled()
  })

  it('Should fetch the logbook when the one loaded is not the selected vessel one', async () => {
    await runOpenFishingTab(OTHER_VESSEL)
    await runOpenFishingTab(undefined)

    expect(getVesselLogbookMock).toHaveBeenCalledTimes(2)
  })
})

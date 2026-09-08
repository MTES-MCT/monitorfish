import { favoriteVesselsApi } from '@features/FavoriteVessel/apis'
import { initFavoriteVessels } from '@features/FavoriteVessel/useCases/initFavoriteVessels'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { beforeEach, describe, expect, it } from '@jest/globals'

import type { Vessel } from '@features/Vessel/Vessel.types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

jest.mock('@features/FavoriteVessel/apis', () => ({
  favoriteVesselsApi: {
    endpoints: {
      initFavoriteVessel: { initiate: jest.fn() }
    }
  }
}))
jest.mock('@features/SideWindow/useCases/addSideWindowBanner', () => ({ addSideWindowBanner: jest.fn() }))

const initFavoriteVesselMock = favoriteVesselsApi.endpoints.initFavoriteVessel.initiate as jest.Mock
const addSideWindowBannerMock = addSideWindowBanner as jest.Mock

const dispatch = jest.fn(action => action) as any

// The key the legacy Redux slice used to persist the favorite vessels in the browser.
const LEGACY_LOCAL_STORAGE_KEY = 'favoriteVessels'

const LEGACY_FAVORITE_VESSEL: Vessel.VesselIdentity = {
  beaconNumber: undefined,
  districtCode: undefined,
  externalReferenceNumber: 'DONTSINK',
  flagState: 'FR',
  internalReferenceNumber: 'FAK000999999',
  ircs: 'CALLME',
  mmsi: undefined,
  vesselId: 1,
  vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
  vesselLength: undefined,
  vesselName: 'PHENOMENE'
}

const EXPECTED_SEEDED_PAYLOAD = [
  {
    cfr: 'FAK000999999',
    externalIdentification: 'DONTSINK',
    flagState: 'FR',
    ircs: 'CALLME',
    name: 'PHENOMENE',
    vesselId: 1,
    vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER
  }
]

describe('initFavoriteVessels()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  it('Should seed the favorites from the legacy local storage key then empty it', async () => {
    // Given the favorites are still stored under the legacy browser local storage key
    window.localStorage.setItem(LEGACY_LOCAL_STORAGE_KEY, JSON.stringify([LEGACY_FAVORITE_VESSEL]))
    initFavoriteVesselMock.mockReturnValue({ unwrap: () => Promise.resolve(EXPECTED_SEEDED_PAYLOAD) })

    // When
    await initFavoriteVessels([LEGACY_FAVORITE_VESSEL])(dispatch)

    // Then the backend is seeded with the mapped favorite vessels...
    expect(initFavoriteVesselMock).toHaveBeenCalledWith(EXPECTED_SEEDED_PAYLOAD)
    // ...and the legacy local storage key is removed, leaving an empty local storage
    expect(window.localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY)).toBeNull()
    expect(addSideWindowBannerMock).not.toHaveBeenCalled()
  })

  it('Should keep the legacy local storage key when the seeding request fails', async () => {
    // Given
    window.localStorage.setItem(LEGACY_LOCAL_STORAGE_KEY, JSON.stringify([LEGACY_FAVORITE_VESSEL]))
    initFavoriteVesselMock.mockReturnValue({ unwrap: () => Promise.reject(new Error('Boom')) })

    // When
    await initFavoriteVessels([LEGACY_FAVORITE_VESSEL])(dispatch)

    // Then the favorites are kept in local storage so the migration can be retried later
    expect(window.localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY)).not.toBeNull()
    expect(addSideWindowBannerMock).toHaveBeenCalled()
  })
})

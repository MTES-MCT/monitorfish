import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { LayerProperties } from '@features/Map/constants'
import { userLayersApi } from '@features/UserLayers/apis'
import { loadUserLayers } from '@features/UserLayers/useCases/loadUserLayers'
import { beforeEach, describe, expect, it } from '@jest/globals'

import type { UserLayers } from '@features/UserLayers/types'

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

jest.mock('@features/UserLayers/apis', () => ({
  userLayersApi: {
    endpoints: {
      getUserLayers: { initiate: jest.fn() },
      initUserLayers: { initiate: jest.fn() }
    }
  }
}))
jest.mock('@features/MainWindow/useCases/addMainWindowBanner', () => ({ addMainWindowBanner: jest.fn() }))

const getUserLayersMock = userLayersApi.endpoints.getUserLayers.initiate as jest.Mock
const initUserLayersMock = userLayersApi.endpoints.initUserLayers.initiate as jest.Mock
const addMainWindowBannerMock = addMainWindowBanner as jest.Mock

const dispatch = jest.fn(action => action) as any
const getState = jest.fn() as any

const EMPTY_USER_LAYERS: UserLayers = {
  baseLayer: undefined,
  displayedAdministrativeLayers: [],
  displayedRegulatoryZoneIds: [],
  selectedRegulatoryZoneIds: []
}

const SAVED_USER_LAYERS: UserLayers = {
  baseLayer: 'SATELLITE',
  displayedAdministrativeLayers: [{ type: 'eez_areas', zone: undefined }],
  displayedRegulatoryZoneIds: ['8'],
  selectedRegulatoryZoneIds: ['8']
}

const setLegacyLocalStorage = () => {
  window.localStorage.setItem('baseLayer', JSON.stringify('DARK'))
  window.localStorage.setItem(
    'homepagelayersShowedOnMap',
    JSON.stringify([
      { type: 'eez_areas' },
      { id: 8, topic: 'Ouest Cotentin Bivalves', type: LayerProperties.REGULATORY.code, zone: 'Praires Ouest cotentin' }
    ])
  )
  window.localStorage.setItem('selectedRegulatoryZoneIds', JSON.stringify([8, 9]))
}

const EXPECTED_SEEDED_PAYLOAD: UserLayers = {
  baseLayer: 'DARK',
  displayedAdministrativeLayers: [{ type: 'eez_areas', zone: undefined }],
  displayedRegulatoryZoneIds: ['8'],
  selectedRegulatoryZoneIds: ['8', '9']
}

const resolveWith = (value: unknown) => ({ unwrap: () => Promise.resolve(value) })

describe('loadUserLayers()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  it('Should return the user layers saved on the user profile without seeding them', async () => {
    // Given
    setLegacyLocalStorage()
    getUserLayersMock.mockReturnValue(resolveWith(SAVED_USER_LAYERS))

    // When
    const userLayers = await loadUserLayers()(dispatch, getState, undefined)

    // Then
    expect(userLayers).toEqual(SAVED_USER_LAYERS)
    expect(initUserLayersMock).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('selectedRegulatoryZoneIds')).not.toBeNull()
  })

  it('Should seed the user layers from the legacy local storage keys then remove them', async () => {
    // Given
    setLegacyLocalStorage()
    getUserLayersMock.mockReturnValue(resolveWith(EMPTY_USER_LAYERS))
    initUserLayersMock.mockReturnValue(resolveWith(EXPECTED_SEEDED_PAYLOAD))

    // When
    const userLayers = await loadUserLayers()(dispatch, getState, undefined)

    // Then
    expect(initUserLayersMock).toHaveBeenCalledWith(EXPECTED_SEEDED_PAYLOAD)
    expect(userLayers).toEqual(EXPECTED_SEEDED_PAYLOAD)
    expect(window.localStorage.getItem('baseLayer')).toBeNull()
    expect(window.localStorage.getItem('homepagelayersShowedOnMap')).toBeNull()
    expect(window.localStorage.getItem('selectedRegulatoryZoneIds')).toBeNull()
    expect(addMainWindowBannerMock).not.toHaveBeenCalled()
  })

  it('Should not seed the user layers When the local storage is empty', async () => {
    // Given
    getUserLayersMock.mockReturnValue(resolveWith(EMPTY_USER_LAYERS))

    // When
    const userLayers = await loadUserLayers()(dispatch, getState, undefined)

    // Then
    expect(userLayers).toEqual(EMPTY_USER_LAYERS)
    expect(initUserLayersMock).not.toHaveBeenCalled()
  })

  it('Should keep the legacy local storage keys and return undefined When the seeding request fails', async () => {
    // Given
    setLegacyLocalStorage()
    getUserLayersMock.mockReturnValue(resolveWith(EMPTY_USER_LAYERS))
    initUserLayersMock.mockReturnValue({ unwrap: () => Promise.reject(new Error('Boom')) })

    // When
    const userLayers = await loadUserLayers()(dispatch, getState, undefined)

    // Then
    expect(userLayers).toBeUndefined()
    expect(window.localStorage.getItem('selectedRegulatoryZoneIds')).not.toBeNull()
    expect(addMainWindowBannerMock).toHaveBeenCalled()
  })
})

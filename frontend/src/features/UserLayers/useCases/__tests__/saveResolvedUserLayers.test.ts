import { LayerProperties } from '@features/Map/constants'
import { saveResolvedUserLayers } from '@features/UserLayers/useCases/saveResolvedUserLayers'
import { saveUserLayers } from '@features/UserLayers/useCases/saveUserLayers'
import { beforeEach, describe, expect, it } from '@jest/globals'

import type { UserLayers } from '@features/UserLayers/types'

jest.mock('@features/UserLayers/useCases/saveUserLayers', () => ({ saveUserLayers: jest.fn() }))

const saveUserLayersMock = saveUserLayers as jest.Mock

const dispatch = jest.fn() as any
const getState = jest.fn() as any

const LOADED_USER_LAYERS: UserLayers = {
  baseLayer: 'SATELLITE',
  displayedAdministrativeLayers: [{ type: 'eez_areas', zone: undefined }],
  displayedRegulatoryZoneIds: ['8'],
  selectedRegulatoryZoneIds: ['8', '9']
}

const givenStateWithRegulatoryZoneIds = (showedIds: number[], selectedIds: number[]) =>
  getState.mockReturnValue({
    layer: {
      showedLayers: [
        { type: 'eez_areas', zone: undefined },
        ...showedIds.map(id => ({ id, topic: 'Topic', type: LayerProperties.REGULATORY.code, zone: 'Zone' }))
      ]
    },
    regulation: {
      selectedRegulatoryLayers: { Topic: selectedIds.map(id => ({ id, topic: 'Topic' })) }
    }
  })

describe('saveResolvedUserLayers()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should save the user layers with the regulatory zone ids resolved to their current version', async () => {
    // Given
    givenStateWithRegulatoryZoneIds([12], [9, 12])

    // When
    await saveResolvedUserLayers(LOADED_USER_LAYERS)(dispatch, getState, undefined)

    // Then
    expect(saveUserLayersMock).toHaveBeenCalledWith({
      baseLayer: 'SATELLITE',
      displayedAdministrativeLayers: [{ type: 'eez_areas', zone: undefined }],
      displayedRegulatoryZoneIds: ['12'],
      selectedRegulatoryZoneIds: ['9', '12']
    })
  })

  it('Should not save the user layers When the regulatory zone ids are unchanged, whatever their order', async () => {
    // Given
    givenStateWithRegulatoryZoneIds([8], [9, 8])

    // When
    await saveResolvedUserLayers(LOADED_USER_LAYERS)(dispatch, getState, undefined)

    // Then
    expect(saveUserLayersMock).not.toHaveBeenCalled()
  })
})

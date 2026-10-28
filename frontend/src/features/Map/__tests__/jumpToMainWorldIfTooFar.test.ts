import { describe, expect, it } from '@jest/globals'
import { WORLD_WIDTH } from '@utils/worldCopy'
import { Collection, Feature, Overlay } from 'ol'
import { Point } from 'ol/geom'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import View from 'ol/View'

import { jumpToMainWorldIfTooFar } from '../utils'

function getMapOnWorldCopy(worldIndex: number) {
  const x = 100_000 + worldIndex * WORLD_WIDTH
  const overlay = new Overlay({ position: [x, 200_000] })
  const nonWrappingFeature = new Feature(new Point([x, 200_000]))
  const wrappingFeature = new Feature(new Point([100_000, 200_000]))
  const layers = [
    new VectorLayer({ source: new VectorSource({ features: [nonWrappingFeature], wrapX: false }) }),
    new VectorLayer({ source: new VectorSource({ features: [wrappingFeature] }) })
  ]
  const interactions = new Collection<Draw>()
  const view = new View({ center: [x, 200_000] })
  // `ol/Map` is mocked in unit tests (see `__mocks__/ol/Map.js`)
  const map = {
    addInteraction: interaction => interactions.push(interaction),
    getAllLayers: () => layers,
    getInteractions: () => interactions,
    getOverlays: () => new Collection([overlay]),
    getView: () => view
  } as any

  const getX = (feature: Feature<Point>) => feature.getGeometry()!.getCoordinates()[0]

  return {
    getCenterX: () => map.getView().getCenter()![0],
    getNonWrappingFeatureX: () => getX(nonWrappingFeature),
    getOverlayX: () => overlay.getPosition()![0],
    getWrappingFeatureX: () => getX(wrappingFeature),
    map
  }
}

describe('jumpToMainWorldIfTooFar()', () => {
  it('Should move the view, overlays and non-wrapping features back to the main world from 2 world copies away', () => {
    const { getCenterX, getNonWrappingFeatureX, getOverlayX, getWrappingFeatureX, map } = getMapOnWorldCopy(-2)

    jumpToMainWorldIfTooFar(map)

    expect(getCenterX()).toBeCloseTo(100_000)
    expect(getOverlayX()).toBeCloseTo(100_000)
    expect(getNonWrappingFeatureX()).toBeCloseTo(100_000)
    expect(getWrappingFeatureX()).toBeCloseTo(100_000)
  })

  it('Should not move the view on the main world or a neighbouring world copy', () => {
    ;[-1, 0, 1].forEach(worldIndex => {
      const { getCenterX, getOverlayX, map } = getMapOnWorldCopy(worldIndex)

      jumpToMainWorldIfTooFar(map)

      expect(getCenterX()).toBeCloseTo(100_000 + worldIndex * WORLD_WIDTH)
      expect(getOverlayX()).toBeCloseTo(100_000 + worldIndex * WORLD_WIDTH)
    })
  })

  it('Should not move the view while drawing', () => {
    const { getCenterX, getNonWrappingFeatureX, map } = getMapOnWorldCopy(3)
    map.addInteraction(new Draw({ type: 'Polygon' }))

    jumpToMainWorldIfTooFar(map)

    expect(getCenterX()).toBeCloseTo(100_000 + 3 * WORLD_WIDTH)
    expect(getNonWrappingFeatureX()).toBeCloseTo(100_000 + 3 * WORLD_WIDTH)
  })
})

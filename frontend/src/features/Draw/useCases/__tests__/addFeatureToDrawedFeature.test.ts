import { setDrawedGeometry } from '@features/Draw/slice'
import { describe, expect, it } from '@jest/globals'
import Feature from 'ol/Feature'
import { Point, Polygon } from 'ol/geom'
import { fromLonLat } from 'ol/proj'

import { addFeatureToDrawedFeature } from '../addFeatureToDrawedFeature'

import type { MultiPolygon as GeoJSONMultiPolygon, Point as GeoJSONPoint } from 'geojson'

function getDispatchedGeometry(feature: Feature, drawedGeometry?: GeoJSONMultiPolygon) {
  const dispatch = jest.fn()
  const getState = () => ({ draw: { drawedGeometry, initialGeometry: undefined, listener: 'MISSION_ZONE' } })

  addFeatureToDrawedFeature(feature)(dispatch, getState)

  const action = dispatch.mock.calls[0]![0] as ReturnType<typeof setDrawedGeometry>
  expect(action.type).toEqual(setDrawedGeometry.type)

  return action.payload
}

describe('features/Draw/useCases/addFeatureToDrawedFeature()', () => {
  it('Should dispatch a point drawn on the next world copy with a longitude within [-180, 180]', () => {
    const feature = new Feature(new Point(fromLonLat([355.5, 47])))

    const geometry = getDispatchedGeometry(feature) as GeoJSONPoint

    expect(geometry.coordinates[0]).toBeCloseTo(-4.5)
    expect(geometry.coordinates[1]).toBeCloseTo(47)
  })

  it('Should dispatch a zone drawn on the previous world copy with longitudes within [-180, 180]', () => {
    const feature = new Feature(
      new Polygon([
        [
          [-365, 46],
          [-364, 46],
          [-364, 47],
          [-365, 46]
        ].map(coordinates => fromLonLat(coordinates))
      ])
    )

    const geometry = getDispatchedGeometry(feature) as GeoJSONMultiPolygon

    geometry.coordinates.flat(2).forEach(([longitude]) => {
      expect(longitude).toBeGreaterThan(-5.001)
      expect(longitude).toBeLessThan(-3.999)
    })
  })

  it('Should append a zone drawn on another world copy to the existing zones of the main world', () => {
    const existingZones: GeoJSONMultiPolygon = {
      coordinates: [
        [
          [
            [-5, 46],
            [-4, 46],
            [-4, 47],
            [-5, 46]
          ]
        ]
      ],
      type: 'MultiPolygon'
    }
    const feature = new Feature(
      new Polygon([
        [
          [357, 46],
          [358, 46],
          [358, 47],
          [357, 46]
        ].map(coordinates => fromLonLat(coordinates))
      ])
    )

    const geometry = getDispatchedGeometry(feature, existingZones) as GeoJSONMultiPolygon

    expect(geometry.coordinates).toHaveLength(2)
    geometry.coordinates[1]!.flat().forEach(([longitude]) => {
      expect(longitude).toBeGreaterThan(-3.001)
      expect(longitude).toBeLessThan(-1.999)
    })
  })
})

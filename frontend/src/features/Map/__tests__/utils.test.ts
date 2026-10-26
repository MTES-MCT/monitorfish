import { expect } from '@jest/globals'
import Feature from 'ol/Feature'
import { Geometry, Polygon } from 'ol/geom'

import { dummyMultiPolygonGeoJSON } from './mocks'
import {
  addGeometryToMultiPolygonGeoJSON,
  getTopmostFeatureAtPixel,
  keepOnlyInitialGeometriesOfMultiPolygon
} from '../utils'

import type { MultiPolygon as GeoJSONMultiPolygon } from 'geojson'

describe('@features/Map/utils.ts', () => {
  it('.addGeometryToMultiPolygonGeoJSON() Should add a geometry with OpenLayers projection to an existing MultiPolygon GeoJSON', () => {
    // Given
    const geometry = new Feature({
      geometry: new Polygon([
        [
          [-78.35780634789, 36.01344090021],
          [-78.23975068421, 36.01344090021],
          [-78.36178387341, 47.81056747476],
          [-78.35780634789, 36.01344090021]
        ]
      ])
    }).getGeometry() as Geometry

    // When
    const result = addGeometryToMultiPolygonGeoJSON(dummyMultiPolygonGeoJSON, geometry)

    // Then
    expect(result).toEqual({
      coordinates: [
        [
          [
            [-72.35720634789077, 48.01344090021331],
            [-72.23975068421811, 48.01344090021331],
            [-72.25330326079572, 47.856056000888486],
            [-72.02742698450211, 47.856056000888486],
            [-72.03646203555387, 48.01344090021331],
            [-71.90545379530359, 48.016462838617144],
            [-71.89190121872596, 47.80146498433339],
            [-72.36172387341665, 47.81056747476546],
            [-72.35720634789077, 48.01344090021331]
          ]
        ],
        [
          [
            [-72.35720634789077, 48.01344090021331],
            [-72.23975068421811, 48.01344090021331],
            [-72.25330326079572, 47.856056000888486],
            [-72.02742698450211, 47.856056000888486],
            [-72.03646203555387, 48.01344090021331],
            [-71.90545379530359, 48.016462838617144],
            [-71.89190121872596, 47.80146498433339],
            [-72.36172387341665, 47.81056747476546],
            [-72.35720634789077, 48.01344090021331]
          ]
        ],
        [
          [
            [-0.0007039001507238724, 0.0003235142439308447],
            [-0.0007028396386532663, 0.0003235142439308447],
            [-0.0007039358814435484, 0.0004294896350529598],
            [-0.0007039001507238724, 0.0003235142439308447]
          ]
        ]
      ],
      type: 'MultiPolygon'
    })
  })

  it('.addGeometryToMultiPolygonGeoJSON() Should add a geometry to an empty MultiPolygon GeoJSON', () => {
    // Given
    const geometry = new Polygon([
      [
        [-78.35780634789, 36.01344090021],
        [-78.23975068421, 36.01344090021],
        [-78.36178387341, 47.81056747476],
        [-78.35780634789, 36.01344090021]
      ]
    ])

    // When
    const result = addGeometryToMultiPolygonGeoJSON({ coordinates: [], type: 'MultiPolygon' }, geometry)

    // Then
    expect(result?.type).toEqual('MultiPolygon')
    expect((result as GeoJSONMultiPolygon).coordinates).toHaveLength(1)
  })

  it('.keepOnlyInitialGeometriesOfMultiPolygon() Should return an empty MultiPolygon unchanged', () => {
    const emptyMultiPolygon: GeoJSONMultiPolygon = { coordinates: [], type: 'MultiPolygon' }

    const result = keepOnlyInitialGeometriesOfMultiPolygon(emptyMultiPolygon, 0)

    expect(result).toEqual(emptyMultiPolygon)
  })

  it('.keepOnlyInitialGeometriesOfMultiPolygon() Should filter 1 polygon of MultiPolygon', () => {
    const result = keepOnlyInitialGeometriesOfMultiPolygon(dummyMultiPolygonGeoJSON, 1)

    // Then
    expect(result).toEqual({
      coordinates: [
        [
          [
            [-72.35720634789077, 48.01344090021331],
            [-72.23975068421811, 48.01344090021331],
            [-72.25330326079572, 47.856056000888486],
            [-72.02742698450211, 47.856056000888486],
            [-72.03646203555387, 48.01344090021331],
            [-71.90545379530359, 48.016462838617144],
            [-71.89190121872596, 47.80146498433339],
            [-72.36172387341665, 47.81056747476546],
            [-72.35720634789077, 48.01344090021331]
          ]
        ]
      ],
      type: 'MultiPolygon'
    })
  })

  it('.keepOnlyInitialGeometriesOfMultiPolygon() Should filter 2 polygons of MultiPolygon', () => {
    const result = keepOnlyInitialGeometriesOfMultiPolygon(dummyMultiPolygonGeoJSON, 0)

    // Then
    expect(result).toEqual({
      coordinates: [],
      type: 'MultiPolygon'
    })
  })

  it('.keepOnlyInitialGeometriesOfMultiPolygon() Should filter no polygon of MultiPolygon', () => {
    const result = keepOnlyInitialGeometriesOfMultiPolygon(dummyMultiPolygonGeoJSON, 2)

    // Then
    expect(result).toEqual({
      coordinates: [
        [
          [
            [-72.35720634789077, 48.01344090021331],
            [-72.23975068421811, 48.01344090021331],
            [-72.25330326079572, 47.856056000888486],
            [-72.02742698450211, 47.856056000888486],
            [-72.03646203555387, 48.01344090021331],
            [-71.90545379530359, 48.016462838617144],
            [-71.89190121872596, 47.80146498433339],
            [-72.36172387341665, 47.81056747476546],
            [-72.35720634789077, 48.01344090021331]
          ]
        ],
        [
          [
            [-72.35720634789077, 48.01344090021331],
            [-72.23975068421811, 48.01344090021331],
            [-72.25330326079572, 47.856056000888486],
            [-72.02742698450211, 47.856056000888486],
            [-72.03646203555387, 48.01344090021331],
            [-71.90545379530359, 48.016462838617144],
            [-71.89190121872596, 47.80146498433339],
            [-72.36172387341665, 47.81056747476546],
            [-72.35720634789077, 48.01344090021331]
          ]
        ]
      ],
      type: 'MultiPolygon'
    })
  })
})

describe('getTopmostFeatureAtPixel()', () => {
  // On a world copy, OpenLayers hits canvas layers (on the main world coordinate) before WebGL layers
  // (on the displayed world copy), whatever their z-index
  // A `null` z-index stands for an unmanaged layer (e.g. a Draw or Modify interaction overlay)
  function getMapHitting(hits: Array<[string, number | undefined | null]>) {
    return {
      forEachFeatureAtPixel: (_pixel, callback) => {
        hits.some(([featureId, zIndex]) =>
          callback({ getId: () => featureId }, zIndex === null ? null : { getZIndex: () => zIndex })
        )
      }
    } as any
  }

  it('Should return the feature of the layer with the highest z-index', () => {
    const map = getMapHitting([
      ['VESSEL_ESTIMATED_POSITION:1', 99],
      ['VESSELS_POINTS:1', 1000]
    ])

    expect(getTopmostFeatureAtPixel(map, [0, 0], {})?.getId()).toEqual('VESSELS_POINTS:1')
  })

  it('Should return the first feature hit When features are in the same layer', () => {
    const map = getMapHitting([
      ['VESSELS_POINTS:1', 1000],
      ['VESSELS_POINTS:2', 1000]
    ])

    expect(getTopmostFeatureAtPixel(map, [0, 0], {})?.getId()).toEqual('VESSELS_POINTS:1')
  })

  it('Should consider a layer without z-index as rendered at z-index 0, as OpenLayers does', () => {
    const map = getMapHitting([
      ['LAYER_WITHOUT_Z_INDEX:1', undefined],
      ['LAYER_WITH_Z_INDEX_0:1', 0],
      ['LAYER_WITH_NEGATIVE_Z_INDEX:1', -1]
    ])

    expect(getTopmostFeatureAtPixel(map, [0, 0], {})?.getId()).toEqual('LAYER_WITHOUT_Z_INDEX:1')
  })

  it('Should return the feature of an unmanaged layer, rendered on top of all layers', () => {
    const map = getMapHitting([
      ['VESSELS_POINTS:1', 1000],
      ['DRAW_SKETCH:1', null]
    ])

    expect(getTopmostFeatureAtPixel(map, [0, 0], {})?.getId()).toEqual('DRAW_SKETCH:1')
  })

  it('Should return undefined When no feature is hit', () => {
    expect(getTopmostFeatureAtPixel(getMapHitting([]), [0, 0], {})).toBeUndefined()
  })
})

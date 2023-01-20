import { expect } from '@jest/globals'
import Feature from 'ol/Feature'
import { Geometry, Polygon } from 'ol/geom'

import { addGeometryToMultiPolygonGeoJSON, keepOnlyInitialGeometriesOfMultiPolygon } from '../index'
import { dummyMultiPolygonGeoJSON } from './mocks'

describe('layers/index', () => {
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

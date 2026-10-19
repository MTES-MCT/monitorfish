import { beforeEach, describe, expect, it } from '@jest/globals'
import { WORLD_WIDTH } from '@utils/worldCopy'
import VectorSource from 'ol/source/Vector'

import { drawMovedLabelLine, drawMovedLabelLineIfFoundAndReturnOffset } from '../label.utils'

import type { LineString } from 'ol/geom'

let mockViewCenterX = 0

jest.mock('@features/Map/monitorfishMap', () => ({
  monitorfishMap: {
    getView: () => ({
      getCenter: () => [mockViewCenterX, 0]
    })
  }
}))

const FEATURE_ID = 'LABEL_LINE:1'
const FEATURE_COORDINATES = [1000, 2000]

function getLineCoordinates(vectorSource: VectorSource) {
  return (vectorSource.getFeatureById(FEATURE_ID)!.getGeometry() as LineString).getCoordinates()
}

describe('features/Vessel/label.utils', () => {
  beforeEach(() => {
    mockViewCenterX = 0
  })

  it.each([
    ['drawMovedLabelLine', drawMovedLabelLine],
    [
      'drawMovedLabelLineIfFoundAndReturnOffset',
      (vectorSource, featureIdToCoordinates, featureId, featureCoordinates) =>
        drawMovedLabelLineIfFoundAndReturnOffset(vectorSource, featureIdToCoordinates, featureId, {
          getGeometry: () => ({ getCoordinates: () => featureCoordinates })
        })
    ]
  ])(
    '%s() Should draw the label line within the world copy displayed by the map When the label was moved on a world copy',
    (_, draw) => {
      // The user panned once around the globe and then moved the label next to the feature copy
      mockViewCenterX = WORLD_WIDTH
      const vectorSource = new VectorSource()
      const featureIdToCoordinates = new Map([
        [FEATURE_ID, { coordinates: [1500 + WORLD_WIDTH, 2500], offset: [10, 10] }]
      ])

      draw(vectorSource, featureIdToCoordinates, FEATURE_ID, FEATURE_COORDINATES)
      // Second call updates the existing line
      draw(vectorSource, featureIdToCoordinates, FEATURE_ID, FEATURE_COORDINATES)

      const [from, to] = getLineCoordinates(vectorSource)
      expect(from![0]).toBeCloseTo(1000 + WORLD_WIDTH)
      expect(to![0]).toBeCloseTo(1500 + WORLD_WIDTH)
      expect([from![1], to![1]]).toEqual([2000, 2500])
    }
  )

  it('Should keep the label line unchanged When the map displays the main world', () => {
    const vectorSource = new VectorSource()
    const featureIdToCoordinates = new Map([[FEATURE_ID, { coordinates: [1500, 2500], offset: [10, 10] }]])

    drawMovedLabelLine(vectorSource, featureIdToCoordinates, FEATURE_ID, FEATURE_COORDINATES)

    expect(getLineCoordinates(vectorSource)).toEqual([FEATURE_COORDINATES, [1500, 2500]])
  })
})

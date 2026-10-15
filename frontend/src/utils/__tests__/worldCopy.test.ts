import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { describe, expect, it } from '@jest/globals'
import {
  getExtentInWorldCopyOf,
  getCoordinatesInWorldCopyOf,
  moveGeometryToMainWorld,
  WORLD_WIDTH
} from '@utils/worldCopy'
import { MultiPolygon, Point, Polygon } from 'ol/geom'
import { fromLonLat, transform } from 'ol/proj'

function toLongitudes(geometry: Point | Polygon | MultiPolygon): number[] {
  return geometry
    .getFlatCoordinates()
    .filter((_, index) => index % 2 === 0)
    .map(x => transform([x, 0], OPENLAYERS_PROJECTION, WSG84_PROJECTION)[0]!)
}

function getSquareFrom(longitude: number) {
  return [
    [longitude, 40],
    [longitude + 1, 40],
    [longitude + 1, 41],
    [longitude, 40]
  ].map(coordinates => fromLonLat(coordinates))
}

describe('utils/worldCopy', () => {
  describe('getCoordinatesInWorldCopyOf()', () => {
    it('Should return the coordinates unchanged When they already are in the reference world copy', () => {
      expect(getCoordinatesInWorldCopyOf([1000, 2000], 5000)).toEqual([1000, 2000])
    })

    it.each([1, -1, 2])('Should move the coordinates to the world copy %i of the reference', worldIndex => {
      const result = getCoordinatesInWorldCopyOf([1000, 2000], worldIndex * WORLD_WIDTH + 5000)

      expect(result[0]).toBeCloseTo(1000 + worldIndex * WORLD_WIDTH)
      expect(result[1]).toEqual(2000)
    })

    it('Should move the coordinates to the nearest copy across the antimeridian', () => {
      // A vessel at 179° W seen from a view centered at 179° E
      const [x] = getCoordinatesInWorldCopyOf(fromLonLat([-179, 0]), fromLonLat([179, 0])[0]!)

      expect(transform([x!, 0], OPENLAYERS_PROJECTION, WSG84_PROJECTION)[0]).toBeCloseTo(181)
    })
  })

  describe('getExtentInWorldCopyOf()', () => {
    it('Should move the whole extent to the world copy of the reference', () => {
      const result = getExtentInWorldCopyOf([0, 10, 1000, 20], -WORLD_WIDTH)

      expect(result[0]).toBeCloseTo(-WORLD_WIDTH)
      expect(result[2]).toBeCloseTo(1000 - WORLD_WIDTH)
      expect([result[1], result[3]]).toEqual([10, 20])
    })
  })

  describe('moveGeometryToMainWorld()', () => {
    it('Should move a point drawn on the next world copy to a longitude within [-180, 180]', () => {
      const point = new Point(fromLonLat([190, 46]))

      moveGeometryToMainWorld(point)

      expect(toLongitudes(point)[0]).toBeCloseTo(-170)
    })

    it('Should move the mission zone of issue #2294, drawn after a world turn, back to the main world', () => {
      const polygon = new Polygon([
        [
          [-301.62009079, -23.7063863],
          [-302.77302655, -13.76677961],
          [-310.91139666, -10.41839985],
          [-322.7459432, -20.81964588],
          [-301.62009079, -23.7063863]
        ].map(coordinates => fromLonLat(coordinates))
      ])

      moveGeometryToMainWorld(polygon)

      toLongitudes(polygon).forEach(longitude => expect(longitude).toBeGreaterThan(37))
      toLongitudes(polygon).forEach(longitude => expect(longitude).toBeLessThan(59))
    })

    it('Should keep a zone crossing the antimeridian contiguous', () => {
      const polygon = new Polygon([
        [
          [170, -10],
          [190, -10],
          [190, -20],
          [170, -20],
          [170, -10]
        ].map(coordinates => fromLonLat(coordinates))
      ])

      moveGeometryToMainWorld(polygon)

      const longitudes = toLongitudes(polygon)
      expect(longitudes[0]).toBeCloseTo(170)
      expect(longitudes[1]).toBeCloseTo(190)
    })

    it('Should leave a geometry of the main world unchanged', () => {
      const point = new Point(fromLonLat([-4.5, 47]))

      moveGeometryToMainWorld(point)

      expect(toLongitudes(point)[0]).toBeCloseTo(-4.5)
    })

    it('Should move each polygon of a multipolygon drawn on different world copies', () => {
      const multiPolygon = new MultiPolygon([[getSquareFrom(-5)], [getSquareFrom(355)], [getSquareFrom(-365)]])

      moveGeometryToMainWorld(multiPolygon)

      toLongitudes(multiPolygon).forEach(longitude => expect(longitude).toBeGreaterThanOrEqual(-5.001))
      toLongitudes(multiPolygon).forEach(longitude => expect(longitude).toBeLessThanOrEqual(-3.999))
    })
  })
})

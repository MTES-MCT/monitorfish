import { fromCircle } from 'ol/geom/Polygon'
import { getLength } from 'ol/sphere'

import { getNauticalMilesFromMeters } from '../../../utils'

export const getNauticalMilesRadiusOfCircle = circle => {
  const polygon = fromCircle(circle)

  return getNauticalMilesRadiusOfCircularPolygon(polygon)
}

export const getNauticalMilesOfLine = line => {
  const length = getLength(line)

  return `${getNauticalMilesFromMeters(length)} nm`
}

function getNauticalMilesRadiusOfCircularPolygon(polygon) {
  const length = getLength(polygon)
  const radius = length / (2 * Math.PI)

  return `r = ${getNauticalMilesFromMeters(radius)} nm`
}

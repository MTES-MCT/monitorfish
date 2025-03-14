import type { Geometry } from 'geojson'
import type { Coordinate } from 'ol/coordinate'

export type DrawedMeasurement = {
  coordinates: Coordinate
  geometry: Geometry
  id: string
  measurement: string
}

export type CircleMeasurementToAdd = {
  circleCoordinatesToAdd: Coordinate
  circleRadiusToAdd: string
}

export type MeasurementInProgress = {
  center?: Coordinate
  coordinates: Coordinate
  measurement: string
}

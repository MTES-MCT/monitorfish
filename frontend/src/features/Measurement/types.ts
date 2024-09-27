import type { GeoJSON as GeoJSONType } from '../../domain/types/GeoJSON'
import type { Coordinate } from 'ol/coordinate'

export type DrawedMeasurement = {
  coordinates: Coordinate
  geometry: GeoJSONType.Geometry
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

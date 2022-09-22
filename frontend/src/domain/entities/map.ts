export const WSG84_PROJECTION = 'EPSG:4326'
export const OPENLAYERS_PROJECTION = 'EPSG:3857'

export enum InteractionType {
  POLYGON = 'POLYGON',
  SQUARE = 'SQUARE'
}

export enum MeasurementType {
  CIRCLE_RANGE = 'Circle',
  MULTILINE = 'LineString'
}

export enum CoordinatesFormat {
  DECIMAL_DEGREES = 'DD',
  DEGREES_MINUTES_DECIMALS = 'DMD',
  DEGREES_MINUTES_SECONDS = 'DMS'
}

export enum MapToolType {
  MEASUREMENT_MENU,
  MEASUREMENT,
  INTEREST_POINT,
  VESSEL_VISIBILITY,
  FILTERS,
  VESSEL_LABELS
}

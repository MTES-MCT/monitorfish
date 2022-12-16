export const WSG84_PROJECTION = 'EPSG:4326'
export const OPENLAYERS_PROJECTION = 'EPSG:3857'

export enum InteractionType {
  CIRCLE = 'CIRCLE',
  POINT = 'POINT',
  POLYGON = 'POLYGON',
  SELECTION = 'SELECTION',
  SQUARE = 'SQUARE'
}

export enum InteractionListener {
  CONTROL_POINT = 'CONTROL_POINT',
  INTEREST_POINT = 'INTEREST_POINT',
  MEASUREMENT = 'MEASUREMENT',
  MISSION_ZONE = 'MISSION_ZONE',
  REGULATION = 'REGULATION',
  SURVEILLANCE_ZONE = 'SURVEILLANCE_ZONE',
  VESSELS_LIST = 'VESSELS_LIST'
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
  FILTERS = 'FILTERS',
  INTEREST_POINT = 'INTEREST_POINT',
  MEASUREMENT = 'MEASUREMENT',
  MEASUREMENT_MENU = 'MEASUREMENT_MENU',
  VESSEL_LABELS = 'VESSEL_LABELS',
  VESSEL_VISIBILITY = 'VESSEL_VISIBILITY'
}

export enum OLGeometryType {
  CIRCLE = 'Circle',
  MULTIPOINT = 'MultiPoint',
  MULTIPOLYGON = 'MultiPolygon',
  POINT = 'Point',
  POLYGON = 'Polygon'
}

export const GeoJSONWithMultipleCoordinates = [OLGeometryType.MULTIPOLYGON, OLGeometryType.MULTIPOINT]

export const InteractionListenerToOLGeometryType: Record<InteractionListener, OLGeometryType | undefined> = {
  [InteractionListener.CONTROL_POINT]: undefined,
  [InteractionListener.INTEREST_POINT]: undefined,
  [InteractionListener.MEASUREMENT]: undefined,
  [InteractionListener.REGULATION]: undefined,
  [InteractionListener.SURVEILLANCE_ZONE]: undefined,
  [InteractionListener.VESSELS_LIST]: undefined,
  [InteractionListener.MISSION_ZONE]: OLGeometryType.MULTIPOLYGON
}

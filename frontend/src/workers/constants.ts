export const CARTOCDN_BASEMAP = 'basemaps.'
export const MAPBOX_BASEMAP = 'mapbox.'
export const OPENSTREETMAP_BASEMAP = 'tile.'
export const SHOM_BASEMAP = 'data.shom.'
export const REGULATIONS =
  '/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:regulations&outputFormat=application/json&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region,next_id'
export const INFRACTIONS = '/api/v1/infractions'

export const WHITELISTED_BASE_MAPS_PATHS = [CARTOCDN_BASEMAP, MAPBOX_BASEMAP, OPENSTREETMAP_BASEMAP, SHOM_BASEMAP]
export const WHITELISTED_AND_READ_ONLY_PATHS = [REGULATIONS, INFRACTIONS]

export const STATIC_ASSETS = ['/landing_background.png']

export const APPLICATION_ROUTES = [
  '/light',
  '/load_light',
  '/backoffice',
  '/regulation',
  '/regulation/new',
  '/regulation/edit',
  '/control_objectives',
  '/fleet_segments',
  '/ext',
  '/side_window'
]

export const CACHED_REQUEST_SIZE = 'CACHED_REQUEST_SIZE'
export const UPDATE_CACHE = 'UPDATE_CACHE'

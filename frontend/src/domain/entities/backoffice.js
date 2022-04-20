import { REGULATORY_SEARCH_PROPERTIES } from './regulatory'

export const BACKOFFICE_SEARCH_PROPERTIES = [
  REGULATORY_SEARCH_PROPERTIES.TOPIC,
  REGULATORY_SEARCH_PROPERTIES.ZONE,
  REGULATORY_SEARCH_PROPERTIES.REGION,
  REGULATORY_SEARCH_PROPERTIES.SEAFRONT,
  REGULATORY_SEARCH_PROPERTIES.REGULATORY_REFERENCES
]

export const GEAR_MESH_SIZE = {
  greaterThan: 'greaterThan',
  greaterThanOrEqualTo: 'greaterThanOrEqualTo',
  lowerThan: 'lowerThan',
  lowerThanOrEqualTo: 'lowerThanOrEqualTo',
  equal: 'equal',
  between: 'between'
}

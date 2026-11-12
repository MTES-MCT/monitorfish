import Fuse from 'fuse.js'

import { REGULATION_SEARCH_OPTIONS } from '../components/RegulationSearch/constants'

import type { RegulatoryZone } from '../types'

let cachedRegulatoryZones: RegulatoryZone[] | undefined
let cachedSearch: Fuse<RegulatoryZone> | undefined

/**
 * Indexing all the regulatory zones takes hundreds of ms on slow computers:
 * the index is built once per version of the zones (the Redux state array), not on each keystroke.
 */
export function getRegulatoryZonesSearch(regulatoryZones: RegulatoryZone[]): Fuse<RegulatoryZone> {
  if (!cachedSearch || cachedRegulatoryZones !== regulatoryZones) {
    cachedSearch = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)
    cachedRegulatoryZones = regulatoryZones
  }

  return cachedSearch
}

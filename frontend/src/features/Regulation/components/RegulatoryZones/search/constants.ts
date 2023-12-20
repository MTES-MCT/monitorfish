import type { RegulatoryZone } from '../../../types'
import type IFuseOptions from 'fuse.js'

export const REGULATION_SEARCH_OPTIONS: IFuseOptions<RegulatoryZone[]> = {
  ignoreLocation: true,
  includeScore: false,
  keys: [
    ['topic'],
    ['zone'],
    ['lawType'],
    ['regulatoryReferences', 'reference'],
    ['gearRegulation', 'authorized', 'selectedCategoriesAndGears'],
    ['gearRegulation', 'unauthorized', 'selectedCategoriesAndGears'],
    ['speciesRegulation', 'authorized', 'species', 'name'],
    ['speciesRegulation', 'unauthorized', 'species', 'name'],
    ['speciesRegulation', 'authorized', 'species', 'code'],
    ['speciesRegulation', 'unauthorized', 'species', 'code'],
    ['region']
  ],
  minMatchCharLength: 2,
  threshold: 0.2
}

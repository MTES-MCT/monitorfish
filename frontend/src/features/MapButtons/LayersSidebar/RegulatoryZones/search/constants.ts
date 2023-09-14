import type { RegulatoryZone } from '../../../../../domain/types/regulation'
import type Fuse from 'fuse.js'

export const REGULATION_SEARCH_OPTIONS: Fuse.IFuseOptions<RegulatoryZone[]> = {
  ignoreLocation: true,
  includeScore: false,
  keys: [
    ['topic'],
    ['zone'],
    ['lawType'],
    ['regulatoryReferences', 'reference'],
    ['gearRegulation', 'authorized', 'selectedCategoriesAndGears'],
    ['gearRegulation', 'unauthorized', 'selectedCategoriesAndGears'],
    ['region']
  ],
  minMatchCharLength: 2,
  threshold: 0.2
}

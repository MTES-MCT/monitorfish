import type { RegulatoryZone } from '../../../../domain/types/regulation'
import type Fuse from 'fuse.js'

export const REGULATION_SEARCH_OPTIONS: Fuse.IFuseOptions<RegulatoryZone[]> = {
  distance: 50,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  includeScore: true,
  keys: [
    ['topic'],
    ['zone'],
    ['lawType'],
    ['regulatoryReference', 'reference'],
    ['gearRegulation', 'authorized', 'selectedCategoriesAndGears'],
    ['gearRegulation', 'unauthorized', 'selectedCategoriesAndGears'],
    ['region']
  ],
  threshold: 0.4
}

import { expect } from '@jest/globals'
import Fuse from 'fuse.js'

import { regulatoryZones } from './__mocks__/regulatoryZones'
import { REGULATION_SEARCH_OPTIONS } from '../../../../../features/MapButtons/LayersSidebar/RegulatoryZones/search/constants'

import type { RegulatoryZone } from '../../../../types/regulation'

describe('searchRegulatoryLayers()', () => {
  it('should search with the year included in the regulatory reference', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('2008').map(result => result.item)

    expect(items).toHaveLength(1)
    expect(items[0]?.zone).toEqual('Praires Ouest cotentin')
  })

  it('should search with the year included in another regulatory reference', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('168/2020').map(result => result.item)

    expect(items).toHaveLength(1)
    expect(items[0]?.zone).toEqual('Praires Ouest cotentin TWO')
  })

  it('should search with the zone field', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('Praires').map(result => result.item)

    expect(items).toHaveLength(2)
  })

  it('should search with the selectedCategoriesAndGears field', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('Chalut').map(result => result.item)

    expect(items).toHaveLength(1)
  })
})

import { expect } from '@jest/globals'
import Fuse from 'fuse.js'

import { regulatoryZones } from './__mocks__/regulatoryZones'
import { REGULATION_SEARCH_OPTIONS } from '../../components/RegulatoryZones/search/constants'

import type { RegulatoryZone } from '../../types'

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

    const items = fuse.search<RegulatoryZone>('chalu').map(result => result.item)

    expect(items).toHaveLength(2)
  })

  it('should search Merlu with the zone field', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('merl').map(result => result.item)

    // It returns Merlu and Merlan
    expect(items).toHaveLength(2)
  })

  it('should search with the regulatory reference number', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('789').map(result => result.item)

    expect(items).toHaveLength(1)
    expect(items[0]?.zone).toEqual('Interdiction')
  })

  it('should search with the specy name', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('oursin').map(result => result.item)

    expect(items).toHaveLength(1)
    expect(items[0]?.zone).toEqual('Praires Ouest cotentin')
  })

  it('should search with the specy code', () => {
    // @ts-ignore
    const fuse = new Fuse(regulatoryZones, REGULATION_SEARCH_OPTIONS)

    const items = fuse.search<RegulatoryZone>('URC').map(result => result.item)

    expect(items).toHaveLength(1)
    expect(items[0]?.zone).toEqual('Praires Ouest cotentin')
  })
})

import { describe, expect, it } from '@jest/globals'

import { getRegulatoryZonesSearch } from '../getRegulatoryZonesSearch'
import { regulatoryZones } from './__mocks__/regulatoryZones'

describe('getRegulatoryZonesSearch()', () => {
  it('Should reuse the search index while the regulatory zones are unchanged', () => {
    // @ts-ignore
    const firstSearch = getRegulatoryZonesSearch(regulatoryZones)
    // @ts-ignore
    const secondSearch = getRegulatoryZonesSearch(regulatoryZones)

    expect(secondSearch).toBe(firstSearch)
  })

  it('Should build a new search index when the regulatory zones are updated', () => {
    // @ts-ignore
    const firstSearch = getRegulatoryZonesSearch(regulatoryZones)
    // @ts-ignore
    const secondSearch = getRegulatoryZonesSearch([...regulatoryZones])

    expect(secondSearch).not.toBe(firstSearch)
  })

  it('Should search in the regulatory zones', () => {
    // @ts-ignore
    const items = getRegulatoryZonesSearch(regulatoryZones)
      .search('Praires')
      .map(result => result.item)

    expect(items).toHaveLength(2)
  })
})

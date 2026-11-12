import { describe, expect, it } from '@jest/globals'
import * as MonitorUi from '@mtes-mct/monitor-ui'

import * as Shim from '../monitorUiWorkerShim'

type Vessel = { externalReferenceNumber?: string; internalReferenceNumber?: string; vesselName?: string }

const VESSELS: Vessel[] = [
  { externalReferenceNumber: 'GV730818', internalReferenceNumber: 'FRA000730818', vesselName: 'JEAN PIERRE MARIE' },
  { externalReferenceNumber: 'CC123456', internalReferenceNumber: 'FRA000123456', vesselName: 'MARIE DU PORT' },
  { externalReferenceNumber: 'AB111111', internalReferenceNumber: 'ESP000111111', vesselName: 'MATALEÑAS SEGUNDO' },
  { externalReferenceNumber: 'XY999999', internalReferenceNumber: 'FRA000999999', vesselName: 'ÉTOILE DE MER' },
  { internalReferenceNumber: 'FRA000555555' }
]
const KEYS = [
  { getFn: (vessel: Vessel) => vessel.vesselName ?? '', name: 'vessel.vesselName' },
  { getFn: (vessel: Vessel) => vessel.internalReferenceNumber ?? '', name: 'vessel.internalReferenceNumber' },
  { getFn: (vessel: Vessel) => vessel.externalReferenceNumber ?? '', name: 'vessel.externalReferenceNumber' }
]
const QUERIES = ['marie', 'MARIE PORT', 'matalenas', 'etoile', 'étoile', 'FRA000', '7308', 'zzz', ' marie ']

describe('workers/monitorUiWorkerShim', () => {
  it.each([
    { isDiacriticSensitive: false, isStrict: true, threshold: 0.4 },
    { isStrict: true, threshold: 0.4 },
    { isStrict: false, threshold: 0.4 },
    { isDiacriticSensitive: true, isStrict: true }
  ])('CustomSearch should find the same items as monitor-ui with %o', options => {
    const expected = new MonitorUi.CustomSearch(structuredClone(VESSELS), KEYS, options)
    const actual = new Shim.CustomSearch(structuredClone(VESSELS), KEYS, options)

    QUERIES.forEach(query => {
      expect(actual.find(query)).toEqual(expected.find(query))
      expect(actual.find(query, 1)).toEqual(expected.find(query, 1))
    })
  })

  it('CustomSearch should refuse the options it does not implement', () => {
    expect(() => new Shim.CustomSearch(VESSELS, KEYS, { cacheKey: 'VESSELS' })).toThrow('not implemented')
  })

  it('customDayjs should behave as monitor-ui one', () => {
    const date = '2026-11-10T14:59:00.000Z'

    expect(Shim.customDayjs(date).utc().format('dddd D MMMM YYYY HH:mm')).toBe(
      MonitorUi.customDayjs(date).utc().format('dddd D MMMM YYYY HH:mm')
    )
    expect(Shim.customDayjs(date).subtract(3, 'hour').valueOf()).toBe(
      MonitorUi.customDayjs(date).subtract(3, 'hour').valueOf()
    )
    expect(Shim.customDayjs(date).isAfter(Shim.customDayjs('2026-11-09'), 'day')).toBe(
      MonitorUi.customDayjs(date).isAfter(MonitorUi.customDayjs('2026-11-09'), 'day')
    )
    expect(Shim.customDayjs(date).isBetween('2026-11-01', '2026-11-30')).toBe(true)
    expect(Shim.customDayjs(date).tz('Europe/Paris').format('HH:mm')).toBe(
      MonitorUi.customDayjs(date).tz('Europe/Paris').format('HH:mm')
    )
  })

  it('Level should have the same values as monitor-ui one', () => {
    expect(Shim.Level).toEqual(MonitorUi.Level)
  })

  it('getOptionsFromLabelledEnum should return the same options as monitor-ui', () => {
    // Labels are not in alphabetical order, to test the sorting
    const labelledEnum = Object.fromEntries([
      ['B', 'Bêta'],
      ['A', 'alpha'],
      ['C', 'Gamma']
    ])

    expect(Shim.getOptionsFromLabelledEnum(labelledEnum)).toEqual(MonitorUi.getOptionsFromLabelledEnum(labelledEnum))
    expect(Shim.getOptionsFromLabelledEnum(labelledEnum, true)).toEqual(
      MonitorUi.getOptionsFromLabelledEnum(labelledEnum, true)
    )
  })
})

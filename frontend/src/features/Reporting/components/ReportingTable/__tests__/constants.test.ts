import { CoordinatesFormat } from '@features/Map/constants'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { describe, expect, it } from '@jest/globals'

import { getReportingCsvMap } from '../constants'

import type { Reporting } from '@features/Reporting/types'

const CSV_MAP = getReportingCsvMap(CoordinatesFormat.DEGREES_MINUTES_SECONDS)

const getCsvValue = (key: string, reporting: Reporting.Reporting) => {
  const entry = CSV_MAP[key]
  if (!entry || typeof entry === 'string' || !entry.transform) {
    throw new Error(`No transform for "${key}".`)
  }

  return entry.transform(reporting)
}

describe('features/Reporting/components/ReportingTable/constants', () => {
  it('should export the NATINF code of an alert', () => {
    const reporting = { type: ReportingType.ALERT, value: { natinfCode: 7059 } } as Reporting.Reporting

    expect(getCsvValue('natinf', reporting)).toEqual(7059)
  })

  it('should export all NATINF codes of an infraction suspicion', () => {
    const reporting = {
      type: ReportingType.INFRACTION_SUSPICION,
      value: { infractions: [{ natinfCode: 2608 }, { natinfCode: 27689 }] }
    } as Reporting.Reporting

    expect(getCsvValue('natinf', reporting)).toEqual('2608 / 27689')
  })

  it('should export an empty NATINF for an observation', () => {
    const reporting = { type: ReportingType.OBSERVATION, value: {} } as Reporting.Reporting

    expect(getCsvValue('natinf', reporting)).toEqual('')
  })

  it('should label an undefined flag state as unknown', () => {
    expect(getCsvValue('flagState', { flagState: 'UNDEFINED' } as Reporting.Reporting)).toEqual('Inconnu')
    expect(getCsvValue('flagState', { flagState: 'FR' } as Reporting.Reporting)).toEqual('FR')
  })
})

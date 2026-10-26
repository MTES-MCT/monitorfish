import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { describe, expect, it } from '@jest/globals'

import { PRIOR_NOTIFICATIONS_CSV_MAP } from '../csvMap'

import type { Logbook } from '@features/Logbook/Logbook.types'

const toCsvRow = (priorNotification: PriorNotification.PriorNotification) =>
  Object.fromEntries(
    Object.entries(PRIOR_NOTIFICATIONS_CSV_MAP).map(([key, entry]) =>
      typeof entry === 'string' || !entry.transform
        ? [typeof entry === 'string' ? entry : entry.label, priorNotification[key]]
        : [entry.label, entry.transform(priorNotification)]
    )
  )

const PRIOR_NOTIFICATION = {
  expectedArrivalDate: '2026-10-20T14:30:00Z',
  onBoardCatches: [
    { faoZone: '27.7.d', species: 'HKE', weight: 300 },
    { faoZone: '27.7.d', species: 'COD', weight: 1000 },
    { faoZone: '27.7.e', species: 'COD', weight: 200 },
    { faoZone: '27.7.e', species: 'SOL', weight: undefined }
  ] as Logbook.Catch[],
  purposeCode: PriorNotification.PurposeCode.LAN,
  reportId: 'FAKE_REPORT_ID',
  riskFactor: 2.3456,
  tripGears: [{ gear: 'OTB' }, { gear: 'OTB' }, { gear: 'GNS' }] as Logbook.Gear[],
  tripNumber: '20260042',
  tripSegments: [{ code: 'SWW01', name: 'Segment' }],
  types: [{ hasDesignatedPorts: false, minimumNotificationPeriod: 4, name: 'Préavis type A' }],
  vesselFlagCountryCode: 'FR'
} as PriorNotification.PriorNotification

describe('features/PriorNotification/components/PriorNotificationList/csvMap', () => {
  it('should flatten a prior notification into Excel-friendly columns', () => {
    const result = toCsvRow(PRIOR_NOTIFICATION)

    expect(result).toMatchObject({
      'Arrivée estimée (UTC)': '20/10/2026 14:30',
      'Date de réception (UTC)': '',
      'Détail captures (kg)': 'COD 1200 / HKE 300 / SOL 0',
      Engins: 'OTB / GNS',
      Espèces: 'COD / HKE / SOL',
      Identifiant: 'FAKE_REPORT_ID',
      Marée: '20260042',
      'Note de risque': 2.3,
      Pavillon: 'FR',
      'Poids total (kg)': 1500,
      Raison: 'Débarquement',
      Segments: 'SWW01',
      Types: 'Préavis type A',
      'Zones FAO': '27.7.d / 27.7.e'
    })
  })

  it('should return empty catch columns for a prior notification without catches', () => {
    const result = toCsvRow({ ...PRIOR_NOTIFICATION, onBoardCatches: [] })

    expect(result).toMatchObject({
      'Détail captures (kg)': '',
      Espèces: '',
      'Poids total (kg)': 0,
      'Zones FAO': ''
    })
  })

  it('should label an undefined flag state as unknown', () => {
    const result = toCsvRow({ ...PRIOR_NOTIFICATION, vesselFlagCountryCode: 'UNDEFINED' })

    expect(result).toMatchObject({ Pavillon: 'Inconnu' })
  })

  it('should return an empty risk factor when there is none', () => {
    const result = toCsvRow({ ...PRIOR_NOTIFICATION, riskFactor: undefined })

    expect(result).toMatchObject({ 'Note de risque': '' })
  })
})

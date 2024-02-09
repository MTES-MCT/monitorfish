import { expect } from '@jest/globals'
import dayjs from 'dayjs'

import { getHealthcheckWarnings } from '../utils'

describe('Healthcheck/utils.tsx', () => {
  it('getHealthcheckWarnings Should contain no warnings', async () => {
    // When
    const warnings = getHealthcheckWarnings({
      dateLastPositionReceivedByAPI: dayjs().toISOString(),
      dateLastPositionUpdatedByPrefect: dayjs().toISOString(),
      dateLogbookMessageReceived: dayjs().toISOString(),
      suddenDropOfPositionsReceived: false
    })

    // Then
    expect(warnings).toStrictEqual([])
  })

  it('getHealthcheckWarnings Should contain one warning', async () => {
    // When
    const warnings = getHealthcheckWarnings({
      dateLastPositionReceivedByAPI: dayjs().subtract(35, 'minutes').toISOString(),
      dateLastPositionUpdatedByPrefect: dayjs().toISOString(),
      dateLogbookMessageReceived: dayjs().toISOString(),
      suddenDropOfPositionsReceived: false
    })

    // Then
    expect(warnings).toStrictEqual(['Nous ne recevons plus aucune position VMS depuis 35 minutes.'])
  })

  it('getHealthcheckWarnings Should contain two warning', async () => {
    // When
    const warnings = getHealthcheckWarnings({
      dateLastPositionReceivedByAPI: dayjs().subtract(35, 'minutes').toISOString(),
      dateLastPositionUpdatedByPrefect: dayjs().subtract(15, 'minutes').toISOString(),
      dateLogbookMessageReceived: dayjs().toISOString(),
      suddenDropOfPositionsReceived: false
    })

    // Then
    expect(warnings).toStrictEqual([
      'Nous ne recevons plus aucune position VMS depuis 35 minutes.',
      "La dernière position des navires n'est plus actualisée depuis 15 minutes (ni sur la carte, ni dans la liste des navires)."
    ])
  })

  it('getHealthcheckWarnings Should contain three warning', async () => {
    // When
    const warnings = getHealthcheckWarnings({
      dateLastPositionReceivedByAPI: dayjs().subtract(35, 'minutes').toISOString(),
      dateLastPositionUpdatedByPrefect: dayjs().subtract(15, 'minutes').toISOString(),
      dateLogbookMessageReceived: dayjs().toISOString(),
      suddenDropOfPositionsReceived: true
    })

    // Then
    expect(warnings).toStrictEqual([
      'Nous ne recevons plus aucune position VMS depuis 35 minutes.',
      "La dernière position des navires n'est plus actualisée depuis 15 minutes (ni sur la carte, ni dans la liste des navires).",
      'Nous recevons 30% de données VMS en moins.'
    ])
  })
})

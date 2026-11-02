import { describe, expect, it } from '@jest/globals'

import { RiskElement } from '../types'
import { getNonCompliantTripLabel, getRiskElementTitle } from '../utils'

const tripsRiskElement: RiskElement.VesselRiskElement = {
  code: 'MOT_MR',
  metrics: {
    compliantTrips: 2,
    nonCompliantTrips: [],
    shareOfNonCompliantTrips: 0.5,
    totalTrips: 4,
    type: RiskElement.MetricsType.TRIPS
  },
  name: 'Exceeding the margin of tolerance',
  reportings: null,
  riskLevel: 4
}

describe('RiskElement/utils', () => {
  it('getNonCompliantTripLabel() should return the trip number and its dates', () => {
    const result = getNonCompliantTripLabel({
      endDateTimeUtc: '2020-08-09T13:47:00Z',
      startDateTimeUtc: '2019-02-17T01:05:00Z',
      tripNumber: '9463714'
    })

    expect(result).toEqual('Marée n°9463714 (17/02/19 au 09/08/20)')
  })

  it('getNonCompliantTripLabel() should return only the trip number when dates are missing', () => {
    const result = getNonCompliantTripLabel({ endDateTimeUtc: null, startDateTimeUtc: null, tripNumber: '9463713' })

    expect(result).toEqual('Marée n°9463713')
  })

  it('getRiskElementTitle() should return the number of non-compliant trips', () => {
    expect(getRiskElementTitle(tripsRiskElement, 'Marge 10%')).toEqual('Marge 10% – 2/4 marées non conformes')
  })

  it('getRiskElementTitle() should return the number of occurrences', () => {
    const riskElement: RiskElement.VesselRiskElement = {
      ...tripsRiskElement,
      metrics: { occurrences: 1, type: RiskElement.MetricsType.OCCURRENCES }
    }

    expect(getRiskElementTitle(riskElement, 'DEP')).toEqual('DEP – 1 occurrence')
  })
})

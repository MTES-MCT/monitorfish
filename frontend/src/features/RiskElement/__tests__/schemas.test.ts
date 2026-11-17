import { describe, expect, it } from '@jest/globals'
import { undefinedize } from '@utils/undefinedize'

import { VesselRiskElementSchema } from '../schemas'

describe('features/RiskElement/schemas', () => {
  // `normalizeRtkBaseQuery()` replaces the `null` values of the API responses with `undefined`
  it('VesselRiskElementSchema Should parse risk elements without reportings nor trip dates', () => {
    const apiResponse = [
      {
        code: 'CLA_CM',
        metrics: { occurrences: 0, type: 'OCCURRENCES' },
        name: 'Fishing in closed area',
        reportings: null,
        riskLevel: 1
      },
      {
        code: 'MOT_MR',
        metrics: {
          compliantTrips: 1,
          nonCompliantTrips: [{ endDateTimeUtc: null, startDateTimeUtc: null, tripNumber: '9463713' }],
          shareOfNonCompliantTrips: 0.5,
          totalTrips: 2,
          type: 'TRIPS'
        },
        name: 'Exceeding the margin of tolerance',
        reportings: null,
        riskLevel: 4
      }
    ]

    const results = (undefinedize(apiResponse) ?? []).map(riskElement => VesselRiskElementSchema.safeParse(riskElement))

    expect(results.map(result => result.error?.issues)).toEqual([undefined, undefined])
  })
})

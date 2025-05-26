import { describe, expect, it } from '@jest/globals'

import { getSortedProfileBarsByDesc } from '../utils'

describe('utils', () => {
  it('getSortedProfileBarsByDesc Should return the percent of each bar', async () => {
    const profile = {
      ANF: 0.0014431550681949913,
      BIB: 0.020464412032601107,
      BRB: 0.0023658279806475268,
      COE: 0.007688940937104463,
      CTC: 0.025196067993896162,
      DAB: 0.002626069058518755,
      GUU: 0.014194967883885162,
      JAX: 0.032530134733903496,
      JOD: 0.0039036161680684194,
      LEM: 0.0017388835657759323,
      MAC: 0.015141299076144173,
      MUR: 0.033121591729065376,
      PLE: 0.018879307285567266,
      RJC: 0.02424973680163715,
      SQC: 0.6998119166755384,
      SYC: 0.04341294344488212,
      WHG: 0.05323112956456936
    }

    // When
    const bars = getSortedProfileBarsByDesc(profile)

    // Then
    expect(bars).toStrictEqual([
      { color: '#A6E3DD', key: 'SQC', value: '70.0' },
      { color: '#D4E3E7', key: 'WHG', value: '5.3' },
      { color: '#C9EEE8', key: 'SYC', value: '4.3' },
      { color: '#C5DADE', key: 'MUR', value: '3.3' },
      { color: '#E1F2F5', key: 'Autres', value: '17.1' }
    ])
  })
})

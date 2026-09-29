import { describe, expect, it } from '@jest/globals'

import { getMissingFieldsSummary } from '../getMissingFieldsSummary'

import type { MissionActionFormValues } from '../../types'

function makeSpecies(speciesCode: string) {
  return { speciesCode, underSized: false } as NonNullable<MissionActionFormValues['speciesOnboard']>[number]
}

describe('getMissingFieldsSummary()', () => {
  it('Should list the species missing a FAO zone', () => {
    const values = { speciesOnboard: ['TRI', 'BLL', 'TUR'].map(makeSpecies) }

    const result = getMissingFieldsSummary(
      ['speciesOnboard[0].faoZones', 'speciesOnboard[1].faoZones', 'speciesOnboard[2].faoZones'],
      values
    )

    expect(result).toEqual(['Zone de pêche des espèces : TRI, BLL, TUR'])
  })

  it('Should name a discard row without species', () => {
    const values = {
      discardedSpecies: [{ speciesCode: '' }] as NonNullable<MissionActionFormValues['discardedSpecies']>
    }

    const result = getMissingFieldsSummary(
      ['discardedSpecies[0].rejectedWeight', 'discardedSpecies[0].discardReason', 'discardedSpecies[0].faoZones'],
      values
    )

    expect(result).toEqual([
      'Qté rejetée : ligne sans espèce',
      'Nature du rejet : ligne sans espèce',
      'Zone de pêche des rejets : ligne sans espèce'
    ])
  })

  it('Should merge latitude and longitude and keep top-level labels', () => {
    const result = getMissingFieldsSummary(['latitude', 'longitude', 'onboardWeighingPermit'], {})

    expect(result).toEqual(['Lieu du contrôle', 'Autorisation pour la pesée à bord'])
  })

  it('Should fall back to the raw field name when unmapped', () => {
    const result = getMissingFieldsSummary(['someUnknownField'], {})

    expect(result).toEqual(['someUnknownField'])
  })
})

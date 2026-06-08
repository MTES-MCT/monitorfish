import { mergeSpeciesOnboardWithPrefill } from '@features/Mission/components/MissionForm/useCases/updateActionSpeciesOnboard'
import { describe, expect, it } from '@jest/globals'

import type { Logbook } from '@features/Logbook/Logbook.types'
import type { MissionAction } from '@features/Mission/missionAction.types'

const makeSpecies = (speciesCode: string, overrides: Partial<MissionAction.SpeciesControl> = {}): any => ({
  controlledWeight: undefined,
  declaredWeight: 100,
  discardReason: undefined,
  faoZones: undefined,
  nbFish: undefined,
  presentationCodes: undefined,
  rejectedWeight: undefined,
  speciesCode,
  underSized: false,
  underSizedWeight: undefined,
  ...overrides
})

const makePrefill = (
  speciesCode: string,
  overrides: Partial<Logbook.SpeciesControlPrefill> = {}
): Logbook.SpeciesControlPrefill => ({
  discardReason: undefined,
  faoZones: undefined,
  presentationCodes: undefined,
  rejectedWeight: undefined,
  speciesCode,
  ...overrides
})

describe('mergeSpeciesOnboardWithPrefill()', () => {
  it('should return base species unchanged when no matching prefill', () => {
    const base = [makeSpecies('COD')]
    const prefill: Logbook.SpeciesControlPrefill[] = []

    const { discardedSpecies, nextSpeciesOnboard } = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(nextSpeciesOnboard).toHaveLength(1)
    expect(nextSpeciesOnboard[0]!.speciesCode).toBe('COD')
    expect(nextSpeciesOnboard[0]!.faoZones).toBeUndefined()
    expect(discardedSpecies).toEqual([])
  })

  it('should merge faoZones and presentationCodes from catch prefill into matching species', () => {
    const base = [makeSpecies('HKE')]
    const prefill = [makePrefill('HKE', { faoZones: ['27.8.a', '27.8.b'], presentationCodes: ['WHL', 'GUT'] })]

    const { discardedSpecies, nextSpeciesOnboard } = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(nextSpeciesOnboard[0]!.faoZones).toEqual(['27.8.a', '27.8.b'])
    expect(nextSpeciesOnboard[0]!.presentationCodes).toEqual(['WHL', 'GUT'])
    expect(nextSpeciesOnboard[0]!.declaredWeight).toBe(100)
    expect(discardedSpecies).toEqual([])
  })

  it('should put DIS prefill into discardedSpecies and leave the catch unchanged', () => {
    const base = [makeSpecies('HKE')]
    const prefill = [makePrefill('HKE', { discardReason: 'DIS', faoZones: ['27.8.b'], rejectedWeight: 50 })]

    const { discardedSpecies, nextSpeciesOnboard } = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(nextSpeciesOnboard[0]!.rejectedWeight).toBeUndefined()
    expect(nextSpeciesOnboard[0]!.discardReason).toBeUndefined()
    expect(discardedSpecies).toHaveLength(1)
    expect(discardedSpecies[0]!.speciesCode).toBe('HKE')
    expect(discardedSpecies[0]!.rejectedWeight).toBe(50)
    expect(discardedSpecies[0]!.discardReason).toBe('DIS')
    expect(discardedSpecies[0]!.faoZones).toEqual(['27.8.b'])
  })

  it('should split DIS and DIM prefill of the same species into two discard entries', () => {
    const base = [makeSpecies('NCA')]
    const prefill = [
      makePrefill('NCA', { discardReason: 'DIS', rejectedWeight: 300 }),
      makePrefill('NCA', { discardReason: 'DIM', rejectedWeight: 2 })
    ]

    const { discardedSpecies, nextSpeciesOnboard } = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(nextSpeciesOnboard).toHaveLength(1)
    expect(discardedSpecies).toHaveLength(2)
    expect(discardedSpecies.find(s => s.discardReason === 'DIS')!.rejectedWeight).toBe(300)
    expect(discardedSpecies.find(s => s.discardReason === 'DIM')!.rejectedWeight).toBe(2)
  })

  it('should not override existing values with undefined from catch prefill', () => {
    const base = [makeSpecies('HKE', { faoZones: ['27.4'] })]
    const prefill = [makePrefill('HKE', { faoZones: undefined })]

    const { nextSpeciesOnboard } = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(nextSpeciesOnboard[0]!.faoZones).toEqual(['27.4'])
  })

  it('should keep DIS-only species out of the catches and in discardedSpecies', () => {
    const base = [makeSpecies('COD')]
    const prefill = [
      makePrefill('COD', { faoZones: ['27.4'] }),
      makePrefill('HKE', { discardReason: 'DIS', rejectedWeight: 30 })
    ]

    const { discardedSpecies, nextSpeciesOnboard } = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(nextSpeciesOnboard).toHaveLength(1)
    expect(nextSpeciesOnboard[0]!.speciesCode).toBe('COD')
    expect(discardedSpecies).toHaveLength(1)
    const hke = discardedSpecies[0]!
    expect(hke.speciesCode).toBe('HKE')
    expect(hke.declaredWeight).toBeUndefined()
    expect(hke.rejectedWeight).toBe(30)
    expect(hke.discardReason).toBe('DIS')
  })

  it('should preserve declaredWeight from base species after merge', () => {
    const base = [makeSpecies('HKE', { declaredWeight: 500 })]
    const prefill = [makePrefill('HKE', { faoZones: ['27.8.a'] })]

    const { nextSpeciesOnboard } = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(nextSpeciesOnboard[0]!.declaredWeight).toBe(500)
  })

  it('should handle empty inputs', () => {
    expect(mergeSpeciesOnboardWithPrefill([], [])).toEqual({ discardedSpecies: [], nextSpeciesOnboard: [] })
  })
})

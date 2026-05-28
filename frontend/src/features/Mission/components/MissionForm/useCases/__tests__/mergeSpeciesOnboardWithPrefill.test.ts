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
  presentationCode: undefined,
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
  presentationCode: undefined,
  rejectedWeight: undefined,
  speciesCode,
  ...overrides
})

describe('mergeSpeciesOnboardWithPrefill()', () => {
  it('should return base species unchanged when no matching prefill', () => {
    const base = [makeSpecies('COD')]
    const prefill: Logbook.SpeciesControlPrefill[] = []

    const result = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(result).toHaveLength(1)
    expect(result[0]!.speciesCode).toBe('COD')
    expect(result[0]!.faoZones).toBeUndefined()
    expect(result[0]!.rejectedWeight).toBeUndefined()
  })

  it('should merge faoZones and presentationCode from prefill into matching species', () => {
    const base = [makeSpecies('HKE')]
    const prefill = [makePrefill('HKE', { faoZones: ['27.8.a', '27.8.b'], presentationCode: 'GUT' })]

    const result = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(result[0]!.faoZones).toEqual(['27.8.a', '27.8.b'])
    expect(result[0]!.presentationCode).toBe('GUT')
    expect(result[0]!.declaredWeight).toBe(100)
  })

  it('should merge rejectedWeight and discardReason DIS from prefill', () => {
    const base = [makeSpecies('HKE')]
    const prefill = [makePrefill('HKE', { discardReason: 'DIS', rejectedWeight: 50 })]

    const result = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(result[0]!.rejectedWeight).toBe(50)
    expect(result[0]!.discardReason).toBe('DIS')
  })

  it('should merge discardReason DIM from prefill', () => {
    const base = [makeSpecies('HKE')]
    const prefill = [makePrefill('HKE', { discardReason: 'DIM', rejectedWeight: 20 })]

    const result = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(result[0]!.discardReason).toBe('DIM')
  })

  it('should not override existing values with undefined from prefill', () => {
    const base = [makeSpecies('HKE', { faoZones: ['27.4'] })]
    const prefill = [makePrefill('HKE', { faoZones: undefined })]

    const result = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(result[0]!.faoZones).toEqual(['27.4'])
  })

  it('should add DIS-only species (in prefill but not in risk factor) with undefined declaredWeight', () => {
    const base = [makeSpecies('COD')]
    const prefill = [
      makePrefill('COD', { faoZones: ['27.4'] }),
      makePrefill('HKE', { discardReason: 'DIS', rejectedWeight: 30 })
    ]

    const result = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(result).toHaveLength(2)
    const hke = result.find(s => s.speciesCode === 'HKE')
    expect(hke).toBeDefined()
    expect(hke!.declaredWeight).toBeUndefined()
    expect(hke!.rejectedWeight).toBe(30)
    expect(hke!.discardReason).toBe('DIS')
  })

  it('should preserve declaredWeight from base species after merge', () => {
    const base = [makeSpecies('HKE', { declaredWeight: 500 })]
    const prefill = [makePrefill('HKE', { faoZones: ['27.8.a'], rejectedWeight: 50 })]

    const result = mergeSpeciesOnboardWithPrefill(base, prefill)

    expect(result[0]!.declaredWeight).toBe(500)
  })

  it('should handle empty inputs', () => {
    expect(mergeSpeciesOnboardWithPrefill([], [])).toEqual([])
  })
})

import { describe, expect, it } from '@jest/globals'

import { getFormDataFishingCatchesFromFormValuesFishingCatches } from '../utils'

import type { ManualPriorNotificationFormValuesFishingCatch } from '../components/ManualPriorNotificationForm/types'

describe('getFormDataFishingCatchesFromFormValuesFishingCatches', () => {
  it('Should return empty array when input is empty', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = []

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toHaveLength(0)
  })

  it('Should handle non-bluefin tuna species correctly', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      { faoArea: 'FA1', quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 },
      { faoArea: 'FA1', quantity: 5, specyCode: 'HAD', specyName: 'Haddock', weight: 50 }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 },
      { faoArea: 'FA1', quantity: 5, specyCode: 'HAD', specyName: 'Haddock', weight: 50 }
    ])
  })

  it('Should handle bluefin tuna species without extended codes', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      { faoArea: 'FA1', quantity: 20, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 200 }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: 20, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 200 }
    ])
  })

  it('Should expand bluefin tuna extended catches', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 5, specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 50 },
          BF2: { quantity: 3, specyName: "Thon rouge de l'Atlantique (Calibre 2)", weight: 30 }
        } as any,
        faoArea: 'FA1',
        quantity: 20,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 200
      }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: 20, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 200 },
      {
        faoArea: 'FA1',
        quantity: 5,
        specyCode: 'BF1',
        specyName: "Thon rouge de l'Atlantique (Calibre 1)",
        weight: 50
      },
      { faoArea: 'FA1', quantity: 3, specyCode: 'BF2', specyName: "Thon rouge de l'Atlantique (Calibre 2)", weight: 30 }
    ])
  })

  it('Should handle multiple FAO areas correctly', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 2, specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 }
        } as any,
        faoArea: 'FA1',
        quantity: 10,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 100
      },
      {
        $bluefinTunaExtendedCatch: {
          BF3: { quantity: 4, specyName: "Thon rouge de l'Atlantique (Calibre 3)", weight: 40 }
        },
        faoArea: 'FA2',
        quantity: 15,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 150
      },
      { faoArea: 'FA2', quantity: 5, specyCode: 'COD', specyName: 'Cod', weight: 50 }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: 10, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 100 },
      {
        faoArea: 'FA1',
        quantity: 2,
        specyCode: 'BF1',
        specyName: "Thon rouge de l'Atlantique (Calibre 1)",
        weight: 20
      },
      { faoArea: 'FA2', quantity: 15, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 150 },
      {
        faoArea: 'FA2',
        quantity: 4,
        specyCode: 'BF3',
        specyName: "Thon rouge de l'Atlantique (Calibre 3)",
        weight: 40
      },
      { faoArea: 'FA2', quantity: 5, specyCode: 'COD', specyName: 'Cod', weight: 50 }
    ])
  })

  it('Should handle undefined faoArea correctly', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      {
        $bluefinTunaExtendedCatch: {
          BF2: { quantity: 2, specyName: "Thon rouge de l'Atlantique (Calibre 2)", weight: 20 }
        } as any,
        quantity: 10,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 100
      },
      { quantity: 5, specyCode: 'SAL', specyName: 'Salmon', weight: 50 }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { quantity: 10, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 100 },
      { quantity: 2, specyCode: 'BF2', specyName: "Thon rouge de l'Atlantique (Calibre 2)", weight: 20 },
      { quantity: 5, specyCode: 'SAL', specyName: 'Salmon', weight: 50 }
    ])
  })

  it('Should not lose data when $bluefinTunaExtendedCatch is undefined', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      {
        faoArea: 'FA1',
        quantity: undefined,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 0
      }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: undefined, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 0 }
    ])
  })

  it('Should handle bluefin tuna catches without a BFT entry', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 2, specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 }
        } as any,
        faoArea: 'FA1',
        quantity: undefined,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 0
      }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: undefined, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 0 },
      { faoArea: 'FA1', quantity: 2, specyCode: 'BF1', specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 }
    ])
  })

  it('Should handle multiple bluefin tuna catches with the same faoArea', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 2, specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 }
        } as any,
        faoArea: 'FA1',
        quantity: 3,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 30
      }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: 3, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 30 },
      { faoArea: 'FA1', quantity: 2, specyCode: 'BF1', specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 }
    ])
  })

  it('Should include all necessary fields in the output', () => {
    const formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[] = [
      { quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 }
    ]

    const result = getFormDataFishingCatchesFromFormValuesFishingCatches(formValuesFishingCatches)

    expect(result).toEqual([{ quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 }])
  })
})

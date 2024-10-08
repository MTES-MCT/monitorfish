import { describe, expect, it } from '@jest/globals'

import { getFormValuesFishingCatchesFromFormDataFishingCatches } from '../utils'

import type { ManualPriorNotificationFormValuesFishingCatch } from '../components/ManualPriorNotificationForm/types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

describe('features/PriorNotification > getFormValuesFishingCatchesFromFormDataFishingCatches()', () => {
  it('Should return empty array when input is empty', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = []

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toHaveLength(0)
  })

  it('Should handle non-bluefin tuna species correctly', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      { faoArea: 'FA1', quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 },
      { faoArea: 'FA1', quantity: 5, specyCode: 'HAD', specyName: 'Haddock', weight: 50 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      { faoArea: 'FA1', quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 },
      { faoArea: 'FA1', quantity: 5, specyCode: 'HAD', specyName: 'Haddock', weight: 50 }
    ])
  })

  it('Should handle bluefin tuna species without extended codes', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      { faoArea: 'FA1', quantity: 20, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 200 }
    ]

    const expected: ManualPriorNotificationFormValuesFishingCatch[] = [
      { faoArea: 'FA1', quantity: 20, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 200 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual(expected)
  })

  it('Should group bluefin tuna extended species under $bluefinTunaExtendedCatch', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      { faoArea: 'FA1', quantity: 20, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 200 },
      {
        faoArea: 'FA1',
        quantity: 5,
        specyCode: 'BF1',
        specyName: "Thon rouge de l'Atlantique (Calibre 1)",
        weight: 50
      },
      { faoArea: 'FA1', quantity: 3, specyCode: 'BF2', specyName: "Thon rouge de l'Atlantique (Calibre 2)", weight: 30 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 5, weight: 50 },
          BF2: { quantity: 3, weight: 30 }
        } as any,
        faoArea: 'FA1',
        quantity: 20,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 200
      }
    ])
  })

  it('Should handle multiple FAO areas correctly', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
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
        specyName: "Thon rouge de l'Atlantique (Calibre 2)",
        weight: 40
      },
      { faoArea: 'FA2', quantity: 5, specyCode: 'COD', specyName: 'Cod', weight: 50 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 2, weight: 20 }
        } as any,
        faoArea: 'FA1',
        quantity: 10,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 100
      },
      {
        $bluefinTunaExtendedCatch: {
          BF3: { quantity: 4, weight: 40 }
        },
        faoArea: 'FA2',
        quantity: 15,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 150
      },
      { faoArea: 'FA2', quantity: 5, specyCode: 'COD', specyName: 'Cod', weight: 50 }
    ])
  })

  it('Should handle undefined faoArea correctly', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      { quantity: 10, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 100 },
      { quantity: 2, specyCode: 'BF2', specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 },
      { quantity: 5, specyCode: 'SAL', specyName: 'Salmon', weight: 50 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      {
        $bluefinTunaExtendedCatch: {
          BF2: { quantity: 2, weight: 20 }
        } as any,
        quantity: 10,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 100
      },
      { quantity: 5, specyCode: 'SAL', specyName: 'Salmon', weight: 50 }
    ])
  })

  it('Should not include BF1, BF2, BF3 as separate entries', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      {
        faoArea: 'FA1',
        quantity: 8,
        specyCode: 'BF1',
        specyName: "Thon rouge de l'Atlantique (Calibre 1)",
        weight: 80
      },
      { faoArea: 'FA1', quantity: 12, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 120 },
      { faoArea: 'FA1', quantity: 6, specyCode: 'BF3', specyName: "Thon rouge de l'Atlantique (Calibre 2)", weight: 60 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 8, weight: 80 },
          BF3: { quantity: 6, weight: 60 }
        } as any,
        faoArea: 'FA1',
        quantity: 12,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 120
      }
    ])
  })

  it('Should handle multiple bluefin tuna catches with the same faoArea', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      { faoArea: 'FA1', quantity: 5, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 50 },
      { faoArea: 'FA1', quantity: 3, specyCode: 'BFT', specyName: "Thon rouge de l'Atlantique", weight: 30 },
      { faoArea: 'FA1', quantity: 2, specyCode: 'BF1', specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 2, weight: 20 }
        } as any,
        faoArea: 'FA1',
        quantity: 3,
        // The last BFT catch overrides the previous one
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 30
      }
    ])
  })

  it('Should handle bluefin tuna catches without a BFT entry', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      { faoArea: 'FA1', quantity: 2, specyCode: 'BF1', specyName: "Thon rouge de l'Atlantique (Calibre 1)", weight: 20 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      {
        $bluefinTunaExtendedCatch: {
          BF1: { quantity: 2, weight: 20 }
        } as any,
        faoArea: 'FA1',
        quantity: undefined,
        specyCode: 'BFT',
        specyName: "Thon rouge de l'Atlantique",
        weight: 0
      }
    ])
  })

  it('Should handle multiple catches with undefined faoArea correctly', () => {
    const formDataFishingCatches: PriorNotification.FormDataFishingCatch[] = [
      { quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 },
      { quantity: 5, specyCode: 'HAD', specyName: 'Haddock', weight: 50 }
    ]

    const result = getFormValuesFishingCatchesFromFormDataFishingCatches(formDataFishingCatches)

    expect(result).toEqual([
      { quantity: 10, specyCode: 'COD', specyName: 'Cod', weight: 100 },
      { quantity: 5, specyCode: 'HAD', specyName: 'Haddock', weight: 50 }
    ])
  })
})

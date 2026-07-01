import { ScipSpeciesType } from '@features/FleetSegment/types'
import { expect } from '@jest/globals'

import {
  getSmallPelagicsShare,
  getSpeciesEISRApplicability,
  hasBftOrSwoOnboard,
  hasDemersalSpeciesOnboard,
  isSeparateStowageOfPreservedSpeciesApplicable,
  isUnderSizedSeparateRecordingApplicable,
  isUnderSizedSeparateStowageApplicable
} from '../getSpeciesEISRApplicability'

import type { MissionAction } from '@features/Mission/missionAction.types'

function makeSpecy(
  speciesCode: string,
  weights: { controlledWeight?: number; declaredWeight?: number } = {}
): MissionAction.SpeciesOnboardControl {
  return {
    controlledWeight: weights.controlledWeight,
    declaredWeight: weights.declaredWeight,
    faoZones: undefined,
    isNotLanded: undefined,
    nbFish: undefined,
    presentationCodes: undefined,
    speciesCode,
    speciesName: undefined,
    underSized: false,
    underSizedWeight: undefined
  }
}

const scipSpeciesTypeByCode: Record<string, ScipSpeciesType> = {
  COD: ScipSpeciesType.DEMERSAL,
  HKE: ScipSpeciesType.DEMERSAL,
  PIL: ScipSpeciesType.PELAGIC
}
const lookup = (code: string) => scipSpeciesTypeByCode[code]

describe('getSpeciesEISRApplicability', () => {
  describe('hasDemersalSpeciesOnboard', () => {
    it('should return true when a demersal species is onboard', () => {
      expect(hasDemersalSpeciesOnboard([makeSpecy('COD'), makeSpecy('PIL')], lookup)).toBe(true)
    })

    it('should return false when no demersal species is onboard', () => {
      expect(hasDemersalSpeciesOnboard([makeSpecy('PIL')], lookup)).toBe(false)
    })

    it('should return false when speciesOnboard is undefined', () => {
      expect(hasDemersalSpeciesOnboard(undefined, lookup)).toBe(false)
    })
  })

  describe('hasBftOrSwoOnboard', () => {
    it('should return true when BFT is onboard', () => {
      expect(hasBftOrSwoOnboard([makeSpecy('BFT')])).toBe(true)
    })

    it('should return true when SWO is onboard', () => {
      expect(hasBftOrSwoOnboard([makeSpecy('SWO')])).toBe(true)
    })

    it('should return false otherwise', () => {
      expect(hasBftOrSwoOnboard([makeSpecy('COD')])).toBe(false)
    })
  })

  describe('getSmallPelagicsShare', () => {
    it('should return undefined when there is no weighed catch', () => {
      expect(getSmallPelagicsShare([])).toBeUndefined()
      expect(getSmallPelagicsShare(undefined)).toBeUndefined()
    })

    it('should compute the share using controlledWeight, falling back to declaredWeight', () => {
      const speciesOnboard = [makeSpecy('PIL', { controlledWeight: 80 }), makeSpecy('COD', { declaredWeight: 20 })]

      expect(getSmallPelagicsShare(speciesOnboard)).toBeCloseTo(0.8)
    })
  })

  describe('isSeparateStowageOfPreservedSpeciesApplicable', () => {
    it('should be applicable when a demersal species is onboard and vessel is >= 12m', () => {
      expect(isSeparateStowageOfPreservedSpeciesApplicable([makeSpecy('COD')], lookup, 12)).toBe(true)
    })

    it('should not be applicable when a demersal species is onboard but vessel is < 12m and no BFT/SWO', () => {
      expect(isSeparateStowageOfPreservedSpeciesApplicable([makeSpecy('COD')], lookup, 11.9)).toBe(false)
    })

    it('should be applicable regardless of length when BFT is onboard', () => {
      expect(isSeparateStowageOfPreservedSpeciesApplicable([makeSpecy('BFT')], lookup, 5)).toBe(true)
    })

    it('should be applicable regardless of length when SWO is onboard', () => {
      expect(isSeparateStowageOfPreservedSpeciesApplicable([makeSpecy('SWO')], lookup, 5)).toBe(true)
    })

    it('should not be applicable when no demersal/BFT/SWO species onboard', () => {
      expect(isSeparateStowageOfPreservedSpeciesApplicable([makeSpecy('PIL')], lookup, 20)).toBe(false)
    })

    it('should be applicable for a demersal species when vessel length is unknown (conservative default)', () => {
      expect(isSeparateStowageOfPreservedSpeciesApplicable([makeSpecy('COD')], lookup, undefined)).toBe(true)
    })
  })

  describe('isUnderSizedSeparateStowageApplicable', () => {
    it('should be applicable for vessels >= 12m regardless of species', () => {
      expect(isUnderSizedSeparateStowageApplicable([makeSpecy('PIL', { controlledWeight: 100 })], 12)).toBe(true)
    })

    it('should not be applicable for vessels < 12m with >= 80% small pelagics', () => {
      const speciesOnboard = [makeSpecy('PIL', { controlledWeight: 90 }), makeSpecy('COD', { controlledWeight: 10 })]

      expect(isUnderSizedSeparateStowageApplicable(speciesOnboard, 11)).toBe(false)
    })

    it('should be applicable for vessels < 12m with < 80% small pelagics', () => {
      const speciesOnboard = [makeSpecy('PIL', { controlledWeight: 79 }), makeSpecy('COD', { controlledWeight: 21 })]

      expect(isUnderSizedSeparateStowageApplicable(speciesOnboard, 11)).toBe(true)
    })

    it('should not be applicable at exactly 80% small pelagics', () => {
      const speciesOnboard = [makeSpecy('PIL', { controlledWeight: 80 }), makeSpecy('COD', { controlledWeight: 20 })]

      expect(isUnderSizedSeparateStowageApplicable(speciesOnboard, 11)).toBe(false)
    })

    it('should be applicable for vessels < 12m with no weighed catch yet', () => {
      expect(isUnderSizedSeparateStowageApplicable([], 11)).toBe(true)
    })

    it('should be applicable when vessel length is unknown (conservative default)', () => {
      const speciesOnboard = [makeSpecy('PIL', { controlledWeight: 90 }), makeSpecy('COD', { controlledWeight: 10 })]

      expect(isUnderSizedSeparateStowageApplicable(speciesOnboard, undefined)).toBe(true)
    })
  })

  describe('isUnderSizedSeparateRecordingApplicable', () => {
    it('should be applicable for vessels >= 10m', () => {
      expect(isUnderSizedSeparateRecordingApplicable(10)).toBe(true)
    })

    it('should not be applicable for vessels < 10m', () => {
      expect(isUnderSizedSeparateRecordingApplicable(9.9)).toBe(false)
    })

    it('should be applicable when vessel length is unknown (conservative default)', () => {
      expect(isUnderSizedSeparateRecordingApplicable(undefined)).toBe(true)
    })
  })

  describe('getSpeciesEISRApplicability', () => {
    it('should aggregate the three applicability flags', () => {
      const speciesOnboard = [makeSpecy('COD', { controlledWeight: 50 })]

      expect(getSpeciesEISRApplicability(speciesOnboard, lookup, 13)).toStrictEqual({
        isSeparateStowageOfPreservedSpeciesApplicable: true,
        isUnderSizedSeparateRecordingApplicable: true,
        isUnderSizedSeparateStowageApplicable: true
      })
    })
  })
})

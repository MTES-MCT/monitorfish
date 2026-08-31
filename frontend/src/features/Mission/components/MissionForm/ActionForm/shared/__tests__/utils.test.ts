import { expect } from '@jest/globals'

import { isPortInInnArea, isThirdCountryOrFlaglessVessel } from '../utils'

describe('MissionForm/ActionForm/shared/utils.ts', () => {
  describe('isThirdCountryOrFlaglessVessel()', () => {
    it('Should return true when the vessel has no flag', () => {
      expect(isThirdCountryOrFlaglessVessel(undefined)).toBe(true)
      expect(isThirdCountryOrFlaglessVessel('UNDEFINED')).toBe(true)
    })

    it('Should return false when the vessel flies an EU flag', () => {
      expect(isThirdCountryOrFlaglessVessel('FR')).toBe(false)
      expect(isThirdCountryOrFlaglessVessel('ES')).toBe(false)
    })

    it('Should return true when the vessel flies a non-EU flag', () => {
      expect(isThirdCountryOrFlaglessVessel('GB')).toBe(true)
      expect(isThirdCountryOrFlaglessVessel('RE')).toBe(true)
    })
  })

  describe('isPortInInnArea()', () => {
    it('Should return false when there is no port', () => {
      expect(isPortInInnArea(undefined)).toBe(false)
    })

    it('Should return false for a metropolitan French port', () => {
      expect(isPortInInnArea('FRZEG')).toBe(false)
    })

    it('Should return true for an overseas or foreign port', () => {
      expect(isPortInInnArea('REPDG')).toBe(true)
      expect(isPortInInnArea('ESVGO')).toBe(true)
    })
  })
})

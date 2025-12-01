import { describe, expect, it } from '@jest/globals'

import { GearMeshSizeEqualityComparator } from '../../../../../domain/entities/backoffice'
import { regulatedGearsIsNotEmpty, regulatedSpeciesIsNotEmpty } from '../utils'

import type { RegulatedGears, RegulatedSpecies } from '../../../types'

describe('regulatedGearsIsNotEmpty()', () => {
  describe('When all properties are empty/false', () => {
    it('should return false for null', () => {
      expect(regulatedGearsIsNotEmpty(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(regulatedGearsIsNotEmpty(undefined)).toBe(false)
    })

    it('should return false for empty object', () => {
      const emptyGears: RegulatedGears = {
        allGears: false,
        allPassiveGears: false,
        allTowedGears: false,
        derogation: false,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
      expect(regulatedGearsIsNotEmpty(emptyGears)).toBe(false)
    })
  })

  describe('When allGears is true', () => {
    it('should return true', () => {
      const gearsWithAllGears: RegulatedGears = {
        allGears: true,
        allPassiveGears: false,
        allTowedGears: false,
        derogation: false,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
      expect(regulatedGearsIsNotEmpty(gearsWithAllGears)).toBe(true)
    })
  })

  describe('When allTowedGears is true', () => {
    it('should return true', () => {
      const gearsWithTowed: RegulatedGears = {
        allGears: false,
        allPassiveGears: false,
        allTowedGears: true,
        derogation: false,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
      expect(regulatedGearsIsNotEmpty(gearsWithTowed)).toBe(true)
    })
  })

  describe('When allPassiveGears is true', () => {
    it('should return true', () => {
      const gearsWithPassive: RegulatedGears = {
        allGears: false,
        allPassiveGears: true,
        allTowedGears: false,
        derogation: false,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
      expect(regulatedGearsIsNotEmpty(gearsWithPassive)).toBe(true)
    })
  })

  describe('When regulatedGears has items', () => {
    it('should return true', () => {
      const gearsWithItems: RegulatedGears = {
        allGears: false,
        allPassiveGears: false,
        allTowedGears: false,
        derogation: false,
        regulatedGearCategories: {},
        regulatedGears: {
          'NET-001': {
            category: 'Filets',
            code: 'NET-001',
            groupId: 'group1',
            mesh: ['80'],
            meshType: GearMeshSizeEqualityComparator.greaterThan,
            name: 'Test Net',
            remarks: 'Test remarks'
          }
        },
        selectedCategoriesAndGears: []
      }
      expect(regulatedGearsIsNotEmpty(gearsWithItems)).toBe(true)
    })
  })

  describe('When regulatedGearCategories has items', () => {
    it('should return true', () => {
      const gearsWithCategories: RegulatedGears = {
        allGears: false,
        allPassiveGears: false,
        allTowedGears: false,
        derogation: false,
        regulatedGearCategories: {
          Chaluts: {
            mesh: ['80'],
            meshType: GearMeshSizeEqualityComparator.greaterThan,
            name: 'Chaluts',
            remarks: 'Test'
          }
        },
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
      expect(regulatedGearsIsNotEmpty(gearsWithCategories)).toBe(true)
    })
  })

  describe('When selectedCategoriesAndGears has items', () => {
    it('should return true', () => {
      const gearsWithSelected: RegulatedGears = {
        allGears: false,
        allPassiveGears: false,
        allTowedGears: false,
        derogation: false,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: ['CAT1', 'GEAR1']
      }
      expect(regulatedGearsIsNotEmpty(gearsWithSelected)).toBe(true)
    })
  })

  describe('When derogation is true', () => {
    it('should return true', () => {
      const gearsWithDerogation: RegulatedGears = {
        allGears: false,
        allPassiveGears: false,
        allTowedGears: false,
        derogation: true,
        regulatedGearCategories: {},
        regulatedGears: {},
        selectedCategoriesAndGears: []
      }
      expect(regulatedGearsIsNotEmpty(gearsWithDerogation)).toBe(true)
    })
  })
})

describe('regulatedSpeciesIsNotEmpty()', () => {
  describe('When all properties are empty', () => {
    it('should return false for null', () => {
      expect(regulatedSpeciesIsNotEmpty(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(regulatedSpeciesIsNotEmpty(undefined)).toBe(false)
    })

    it('should return false for empty object', () => {
      const emptySpecies: RegulatedSpecies = {
        allSpecies: false,
        species: [],
        speciesGroups: []
      }
      expect(regulatedSpeciesIsNotEmpty(emptySpecies)).toBe(false)
    })
  })

  describe('When allSpecies is true', () => {
    it('should return true', () => {
      const speciesWithAll: RegulatedSpecies = {
        allSpecies: true,
        species: [],
        speciesGroups: []
      }
      expect(regulatedSpeciesIsNotEmpty(speciesWithAll)).toBe(true)
    })
  })

  describe('When species array has items', () => {
    it('should return true', () => {
      const speciesWithItems: RegulatedSpecies = {
        allSpecies: false,
        species: [
          {
            code: 'COD',
            name: 'Cod',
            remarks: 'Test remarks'
          }
        ],
        speciesGroups: []
      }
      expect(regulatedSpeciesIsNotEmpty(speciesWithItems)).toBe(true)
    })
  })

  describe('When speciesGroups array has items', () => {
    it('should return true', () => {
      const speciesWithGroups: RegulatedSpecies = {
        allSpecies: false,
        species: [],
        speciesGroups: ['Demersal fish', 'Pelagic fish']
      }
      expect(regulatedSpeciesIsNotEmpty(speciesWithGroups)).toBe(true)
    })
  })

  describe('When both species and speciesGroups have items', () => {
    it('should return true', () => {
      const speciesWithBoth: RegulatedSpecies = {
        allSpecies: false,
        species: [
          {
            code: 'COD',
            name: 'Cod',
            remarks: 'Test'
          }
        ],
        speciesGroups: ['Demersal fish']
      }
      expect(regulatedSpeciesIsNotEmpty(speciesWithBoth)).toBe(true)
    })
  })
})

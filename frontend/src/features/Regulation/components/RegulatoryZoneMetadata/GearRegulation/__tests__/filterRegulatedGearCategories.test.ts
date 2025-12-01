import { describe, expect, it } from '@jest/globals'

import { filterRegulatedGearCategories } from '../utils'

import type { GearCategory } from '../../../../types'

describe('filterRegulatedGearCategories()', () => {
  const mockRegulatedGearCategories: Record<string, GearCategory> = {
    Chaluts: {
      mesh: undefined,
      meshType: undefined,
      name: 'Chaluts',
      remarks: undefined
    },
    Dragues: {
      mesh: undefined,
      meshType: undefined,
      name: 'Dragues',
      remarks: undefined
    },
    'Filets tournants': {
      mesh: undefined,
      meshType: undefined,
      name: 'Filets tournants',
      remarks: undefined
    },
    'Sennes traînantes': {
      mesh: undefined,
      meshType: undefined,
      name: 'Sennes traînantes',
      remarks: undefined
    }
  }

  const mockGroupsToCategories = {
    allPassiveGears: ['Filets tournants', 'Pièges et casiers'],
    allTowedGears: ['Chaluts', 'Sennes traînantes', 'Dragues']
  }

  describe('When allTowedGears is false and allPassiveGears is false', () => {
    it('should return all regulated gear categories unchanged', () => {
      // Given
      const allTowedGears = false
      const allPassiveGears = false

      // When
      const result = filterRegulatedGearCategories(
        mockRegulatedGearCategories,
        allTowedGears,
        allPassiveGears,
        mockGroupsToCategories
      )

      // Then
      expect(result).toStrictEqual(mockRegulatedGearCategories)
      expect(result).toHaveProperty('Chaluts')
      expect(result).toHaveProperty('Sennes traînantes')
      expect(result).toHaveProperty('Dragues')
      expect(result).toHaveProperty('Filets tournants')
    })
  })

  describe('When allTowedGears is true', () => {
    it('should exclude all towed gear categories', () => {
      // Given
      const allTowedGears = true
      const allPassiveGears = false

      // When
      const result = filterRegulatedGearCategories(
        mockRegulatedGearCategories,
        allTowedGears,
        allPassiveGears,
        mockGroupsToCategories
      )

      // Then
      expect(result).not.toHaveProperty('Chaluts')
      expect(result).not.toHaveProperty('Sennes traînantes')
      expect(result).not.toHaveProperty('Dragues')
      expect(result).toHaveProperty('Filets tournants')
      expect(Object.keys(result)).toHaveLength(1)
    })
  })

  describe('When allPassiveGears is true', () => {
    it('should exclude all passive gear categories', () => {
      // Given
      const allTowedGears = false
      const allPassiveGears = true

      // When
      const result = filterRegulatedGearCategories(
        mockRegulatedGearCategories,
        allTowedGears,
        allPassiveGears,
        mockGroupsToCategories
      )

      // Then
      expect(result).toHaveProperty('Chaluts')
      expect(result).toHaveProperty('Sennes traînantes')
      expect(result).toHaveProperty('Dragues')
      expect(result).not.toHaveProperty('Filets tournants')
      expect(Object.keys(result)).toHaveLength(3)
    })
  })

  describe('When both allTowedGears and allPassiveGears are true', () => {
    it('should exclude all towed and passive gear categories', () => {
      // Given
      const allTowedGears = true
      const allPassiveGears = true

      // When
      const result = filterRegulatedGearCategories(
        mockRegulatedGearCategories,
        allTowedGears,
        allPassiveGears,
        mockGroupsToCategories
      )

      // Then
      expect(result).toStrictEqual({})
      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe('When groupsToCategories is undefined', () => {
    it('should return all categories unchanged', () => {
      // Given
      const allTowedGears = true
      const allPassiveGears = true
      const undefinedGroupsToCategories = undefined

      // When
      const result = filterRegulatedGearCategories(
        mockRegulatedGearCategories,
        allTowedGears,
        allPassiveGears,
        undefinedGroupsToCategories
      )

      // Then
      expect(result).toStrictEqual(mockRegulatedGearCategories)
    })
  })

  describe('When regulatedGearCategories is empty', () => {
    it('should return empty object', () => {
      // Given
      const emptyCategories: Record<string, GearCategory> = {}
      const allTowedGears = true
      const allPassiveGears = false

      // When
      const result = filterRegulatedGearCategories(
        emptyCategories,
        allTowedGears,
        allPassiveGears,
        mockGroupsToCategories
      )

      // Then
      expect(result).toStrictEqual({})
    })
  })

  describe('Should not mutate original object', () => {
    it('should return a new object without modifying the original', () => {
      // Given
      const originalCategories = { ...mockRegulatedGearCategories }
      const allTowedGears = true
      const allPassiveGears = false

      // When
      filterRegulatedGearCategories(mockRegulatedGearCategories, allTowedGears, allPassiveGears, mockGroupsToCategories)

      // Then
      expect(mockRegulatedGearCategories).toStrictEqual(originalCategories)
    })
  })
})

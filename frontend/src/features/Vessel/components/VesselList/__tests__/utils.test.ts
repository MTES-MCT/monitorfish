import { describe, expect, it } from '@jest/globals'

import { getLastControlDateTimeAndControlType } from '../utils'

import type { Vessel } from '@features/Vessel/Vessel.types'

describe('utils/getLastControlDateTimeAndControlType()', () => {
  const mockVessel: Vessel.ActiveVessel = {
    lastControlAtQuayDateTime: '2024-01-15T14:30:00Z',
    lastControlAtSeaDateTime: '2024-01-20T10:00:00Z'
  } as Vessel.ActiveVessel

  describe('when no filters are active (both false)', () => {
    it('should return the most recent control with correct type when sea is more recent', () => {
      const vessel = {
        ...mockVessel,
        lastControlAtQuayDateTime: '2024-01-15T14:30:00Z',
        lastControlAtSeaDateTime: '2024-01-20T10:00:00Z'
      } as Vessel.ActiveVessel

      const result = getLastControlDateTimeAndControlType(false, false, vessel)

      expect(result.lastControlDateTime).toBe('2024-01-20T10:00:00Z')
      expect(result.controlType).toBe('(mer)')
    })

    it('should return the most recent control with correct type when quay is more recent', () => {
      const vessel = {
        ...mockVessel,
        lastControlAtQuayDateTime: '2024-01-15T14:30:00Z',
        lastControlAtSeaDateTime: '2024-01-10T10:00:00Z'
      } as Vessel.ActiveVessel

      const result = getLastControlDateTimeAndControlType(false, false, vessel)

      expect(result.lastControlDateTime).toBe('2024-01-15T14:30:00Z')
      expect(result.controlType).toBe('(quai)')
    })
  })

  describe('when only sea control filter is active', () => {
    it('should return sea control date with sea type', () => {
      const result = getLastControlDateTimeAndControlType(true, false, mockVessel)

      expect(result.lastControlDateTime).toBe('2024-01-20T10:00:00Z')
      expect(result.controlType).toBe('(mer)')
    })

    it('should return undefined when no sea control exists', () => {
      const vessel = {
        ...mockVessel,
        lastControlAtSeaDateTime: undefined
      } as Vessel.ActiveVessel

      const result = getLastControlDateTimeAndControlType(true, false, vessel)

      expect(result.lastControlDateTime).toBeUndefined()
      expect(result.controlType).toBe('(mer)')
    })
  })

  describe('when only quay control filter is active', () => {
    it('should return quay control date with quay type', () => {
      const result = getLastControlDateTimeAndControlType(false, true, mockVessel)

      expect(result.lastControlDateTime).toBe('2024-01-15T14:30:00Z')
      expect(result.controlType).toBe('(quai)')
    })

    it('should return undefined when no quay control exists', () => {
      const vessel = {
        ...mockVessel,
        lastControlAtQuayDateTime: undefined
      } as Vessel.ActiveVessel

      const result = getLastControlDateTimeAndControlType(false, true, vessel)

      expect(result.lastControlDateTime).toBeUndefined()
      expect(result.controlType).toBe('(quai)')
    })
  })

  describe('when both filters are active', () => {
    it('should return the most recent control with correct type', () => {
      const vessel = {
        ...mockVessel,
        lastControlAtQuayDateTime: '2024-01-15T14:30:00Z',
        lastControlAtSeaDateTime: '2024-01-20T10:00:00Z'
      } as Vessel.ActiveVessel

      const result = getLastControlDateTimeAndControlType(true, true, vessel)

      expect(result.lastControlDateTime).toBe('2024-01-20T10:00:00Z')
      expect(result.controlType).toBe('(mer)')
    })
  })

  describe('edge cases', () => {
    it('should handle undefined vessel', () => {
      const result = getLastControlDateTimeAndControlType(false, false, undefined)

      expect(result.lastControlDateTime).toBeUndefined()
      expect(result.controlType).toBeUndefined()
    })

    it('should prioritize specific filter when both control dates exist', () => {
      const vessel = {
        ...mockVessel,
        lastControlAtQuayDateTime: '2024-01-25T14:30:00Z',
        lastControlAtSeaDateTime: '2024-01-20T10:00:00Z' // Quay is more recent
      } as Vessel.ActiveVessel

      // When only sea filter is active, should return sea control regardless of which is more recent
      const resultSeaFilter = getLastControlDateTimeAndControlType(true, false, vessel)
      expect(resultSeaFilter.lastControlDateTime).toBe('2024-01-20T10:00:00Z')
      expect(resultSeaFilter.controlType).toBe('(mer)')

      // When only quay filter is active, should return quay control regardless of which is more recent
      const resultQuayFilter = getLastControlDateTimeAndControlType(false, true, vessel)
      expect(resultQuayFilter.lastControlDateTime).toBe('2024-01-25T14:30:00Z')
      expect(resultQuayFilter.controlType).toBe('(quai)')
    })
  })
})

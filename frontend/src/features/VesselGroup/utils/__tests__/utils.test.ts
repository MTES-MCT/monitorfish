import { type VesselGroup } from '@features/VesselGroup/types'
import { isHardcodedGroup, isPriorityGroup } from '@features/VesselGroup/utils/utils'
import { describe, expect, it } from '@jest/globals'

describe('isHardcodedGroup', () => {
  it('should return true for negative ids', () => {
    expect(isHardcodedGroup(-1)).toBe(true)
    expect(isHardcodedGroup(-2)).toBe(true)
  })

  it('should return false for zero or positive ids', () => {
    expect(isHardcodedGroup(0)).toBe(false)
    expect(isHardcodedGroup(1)).toBe(false)
  })
})

describe('isPriorityGroup', () => {
  it('should return true only when isPriorityGroup is true', () => {
    expect(isPriorityGroup({ isPriorityGroup: true } as VesselGroup)).toBe(true)
  })

  it('should return false when isPriorityGroup is false or undefined', () => {
    expect(isPriorityGroup({ isPriorityGroup: false } as VesselGroup)).toBe(false)
    expect(isPriorityGroup({} as VesselGroup)).toBe(false)
  })
})

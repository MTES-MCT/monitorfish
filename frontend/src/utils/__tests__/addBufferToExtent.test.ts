import { describe, expect, it } from '@jest/globals'

import { addBufferToExtent } from '../addBufferToExtent'

import type { Extent } from 'ol/extent'

describe('utils/addBufferToExtent()', () => {
  it('should correctly add buffer to a given extent', () => {
    const originalExtent: Extent = [0, 0, 100, 100]
    const bufferRatio = 0.1

    const bufferedExtent = addBufferToExtent(originalExtent, bufferRatio)

    const expectedExtent: Extent = [-10, -10, 110, 110]
    expect(bufferedExtent).toEqual(expectedExtent)
  })

  it('should handle negative extents correctly', () => {
    const originalExtent: Extent = [-50, -50, 50, 50]
    const bufferRatio = 0.2

    const result = addBufferToExtent(originalExtent, bufferRatio)

    const expectedExtent: Extent = [-70, -70, 70, 70]
    expect(result).toEqual(expectedExtent)
  })

  it('should return the same extent when buffer ratio is 0', () => {
    const originalExtent: Extent = [10, 20, 30, 40]
    const bufferRatio = 0

    const result = addBufferToExtent(originalExtent, bufferRatio)

    expect(result).toEqual(originalExtent)
  })

  it('should handle very small extents', () => {
    const originalExtent: Extent = [5, 5, 6, 6]
    const bufferRatio = 0.5

    const result = addBufferToExtent(originalExtent, bufferRatio)

    expect(result).toEqual([4.5, 4.5, 6.5, 6.5])
  })
})

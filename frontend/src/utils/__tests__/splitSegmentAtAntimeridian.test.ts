import { describe, expect, it } from '@jest/globals'
import { splitSegmentAtAntimeridian } from '@utils/splitSegmentAtAntimeridian'

import type { Coordinates } from '@mtes-mct/monitor-ui'

describe('utils/splitSegmentAtAntimeridian()', () => {
  it('Should return the original segment When it does not cross the antimeridian', () => {
    // Given
    const start: Coordinates = [1, 45]
    const end: Coordinates = [2, 46]

    // When
    const segments = splitSegmentAtAntimeridian(start, end)

    // Then
    expect(segments).toEqual([[start, end]])
  })

  it('Should return the original segment When it is long but does not cross the antimeridian', () => {
    // Given
    const start: Coordinates = [-90, 0]
    const end: Coordinates = [89, 0]

    // When
    const segments = splitSegmentAtAntimeridian(start, end)

    // Then
    expect(segments).toEqual([[start, end]])
  })

  it('Should split the segment When it crosses the antimeridian eastward', () => {
    // Given
    const start: Coordinates = [179.5, 10]
    const end: Coordinates = [-179.5, 11]

    // When
    const segments = splitSegmentAtAntimeridian(start, end)

    // Then
    expect(segments).toEqual([
      [
        [179.5, 10],
        [180, 10.5]
      ],
      [
        [-180, 10.5],
        [-179.5, 11]
      ]
    ])
  })

  it('Should split the segment When it crosses the antimeridian westward', () => {
    // Given
    const start: Coordinates = [-179.5, 10]
    const end: Coordinates = [179.5, 11]

    // When
    const segments = splitSegmentAtAntimeridian(start, end)

    // Then
    expect(segments).toEqual([
      [
        [-179.5, 10],
        [-180, 10.5]
      ],
      [
        [180, 10.5],
        [179.5, 11]
      ]
    ])
  })
})

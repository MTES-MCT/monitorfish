import { describe, expect, it } from '@jest/globals'

import { pushToObjectAtIndex } from '../pushToObjectAtIndex'

describe('utils/pushToObjectAtIndex()', () => {
  it('should push to an existing index', () => {
    // Given
    const object = {
      anotherIndex: [456],
      FOUND_INDEX: [123, 456]
    }

    // When
    const result = pushToObjectAtIndex(object, 'FOUND_INDEX', 789)

    // Then
    expect(result).toEqual({
      anotherIndex: [456],
      FOUND_INDEX: [123, 456, 789]
    })
  })

  it('should create an array to a non existing index', () => {
    // Given
    const object = {
      anotherIndex: [456]
    }

    // When
    const result = pushToObjectAtIndex(object, 'NOT_FOUND', 789)

    // Then
    expect(result).toEqual({
      anotherIndex: [456],
      NOT_FOUND: [789]
    })
  })
})

import { expect } from '@jest/globals'

import { getLocalstorageProperty } from '../getLocalstorageProperty'

describe('utils/getLocalstorageProperty', () => {
  it('should get a property in a localstorage key', async () => {
    // Given
    window.localStorage.setItem('TEST_KEY', JSON.stringify({ testProperty: false }))

    // When
    const value = getLocalstorageProperty(true, 'TEST_KEY', 'testProperty')

    // Then
    expect(value).toBeFalsy()
  })

  it('should return a default value When the property is not found', async () => {
    // Given
    window.localStorage.setItem('TEST_KEY', JSON.stringify({}))

    // When
    const value = getLocalstorageProperty(true, 'TEST_KEY', 'testProperty')

    // Then
    expect(value).toBeTruthy()
  })
})

import { describe, expect, it } from '@jest/globals'

import { getUrlOrPathWithQueryParams } from '../getUrlOrPathWithQueryParams'

describe('getUrlOrPathWithQueryParams', () => {
  it('should handle simple key-value pairs correctly', () => {
    const path = '/example'
    const queryParams = { age: '30', name: 'John' }

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example?age=30&name=John')
  })

  it('should handle arrays correctly', () => {
    const path = '/example'
    const queryParams = { colors: ['blue', 'green', 'red'] }

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example?colors=blue,green,red')
  })

  it('should handle nested objects correctly', () => {
    const path = '/example'
    const queryParams = { user: { age: '30', name: 'John' } }

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example?user.age=30&user.name=John')
  })

  it('should exclude undefined or null values', () => {
    const path = '/example'
    const queryParams = { age: undefined, location: null, name: 'John' }

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example?name=John')
  })

  it('should return the original URL if queryParamsAsObject is empty', () => {
    const path = '/example'
    const queryParams = {}

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example')
  })
})

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

  it('should exclude undefined or null values', () => {
    const path = '/example'
    const queryParams = { age: undefined, location: null, name: 'John' }

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example?name=John')
  })

  it('should percent-encode values so that reserved characters do not break the query string', () => {
    const path = '/example'
    const queryParams = { searched: '%ARIA CE', startedAfterDateTime: '2026-07-02T00:00:00+02:00' }

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example?searched=%25ARIA%20CE&startedAfterDateTime=2026-07-02T00%3A00%3A00%2B02%3A00')
  })

  it('should return the original URL if queryParamsAsObject is empty', () => {
    const path = '/example'
    const queryParams = {}

    const result = getUrlOrPathWithQueryParams(path, queryParams)

    expect(result).toBe('/example')
  })
})

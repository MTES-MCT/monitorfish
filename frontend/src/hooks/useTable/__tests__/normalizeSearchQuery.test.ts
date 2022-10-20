/**
 * @jest-environment jsdom
 */

import { expect } from '@jest/globals'

import { normalizeSearchQuery } from '../utils'

describe('hooks/useTable/utils.normalizeSearchQuery()', () => {
  it('should return the expected extended search query from 1 word search query', () => {
    const searchQuery = 'query'

    const result = normalizeSearchQuery(searchQuery)

    expect(result).toStrictEqual(`'query`)
  })

  it('should return the expected extended search query from 3 words search query', () => {
    const searchQuery = 'a longer query'

    const result = normalizeSearchQuery(searchQuery)

    expect(result).toStrictEqual(`'a 'longer 'query`)
  })

  it('should return undefined from an empty-ish search query', () => {
    const searchQuery = ' '

    const result = normalizeSearchQuery(searchQuery)

    expect(result).toBeUndefined()
  })

  it('should return undefined from an undefined search query', () => {
    const searchQuery = undefined

    const result = normalizeSearchQuery(searchQuery)

    expect(result).toBeUndefined()
  })
})

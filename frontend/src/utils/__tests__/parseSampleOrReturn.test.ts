import { describe, expect, it } from '@jest/globals'
import { z } from 'zod'

import { parseSampleOrReturn } from '../parseSampleOrReturn'

const ItemSchema = z.strictObject({ id: z.number() })

describe('utils/parseSampleOrReturn()', () => {
  it('Should only validate a sample of the items, spread over the whole collection', () => {
    const items = Array.from({ length: 1000 }, (_, index) => ({ id: index }))
    const parseSpy = jest.spyOn(ItemSchema, 'parse')

    const result = parseSampleOrReturn(items, ItemSchema, 10)

    expect(result).toBe(items)
    expect(parseSpy).toHaveBeenCalledTimes(10)
    expect(parseSpy.mock.calls.map(([item]) => (item as { id: number }).id)).toEqual([
      0, 100, 200, 300, 400, 500, 600, 700, 800, 900
    ])
    parseSpy.mockRestore()
  })

  it('Should validate every item of a small collection', () => {
    const items = [{ id: 1 }, { id: 2 }]
    const parseSpy = jest.spyOn(ItemSchema, 'parse')

    parseSampleOrReturn(items, ItemSchema, 10)

    expect(parseSpy).toHaveBeenCalledTimes(2)
    parseSpy.mockRestore()
  })

  it('Should return the collection even when a sampled item is invalid', () => {
    const items = [{ id: 1 }, { id: 'invalid' }]

    expect(parseSampleOrReturn(items, ItemSchema, 10)).toBe(items)
  })

  it('Should return the body when it is not an array', () => {
    const body = { not: 'an array' }

    expect(parseSampleOrReturn(body, ItemSchema, 10)).toBe(body)
  })
})

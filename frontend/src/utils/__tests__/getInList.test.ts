/* eslint-disable @typescript-eslint/naming-convention */

import { expect } from '@jest/globals'

import { getFromList } from '../getFromList'

describe('utils/getFromList()', () => {
  it('should return the expected item with <equals> when there is a match', () => {
    const list = [
      {
        id: 1,
        label: 'First item label'
      },
      {
        id: 2,
        label: 'Second item label'
      }
    ]
    const whereProp = 'id'
    const equals = 1

    const result = getFromList(list, whereProp, equals)

    expect(result).toMatchObject({
      id: 1,
      label: 'First item label'
    })
  })

  it('should return `undefined` with <equals> when there is no match', () => {
    const list = [
      {
        id: 1,
        label: 'First item label'
      },
      {
        id: 2,
        label: 'Second item label'
      }
    ]
    const whereProp = 'id'
    const equals = 3

    const result = getFromList(list, whereProp, equals)

    expect(result).toBeUndefined()
  })

  it('should return the expected item with <satisfies> when there is a match', () => {
    const list = [
      {
        id: 1,
        label: 'First item label'
      },
      {
        id: 2,
        label: 'Second item label'
      }
    ]
    const whereProp = 'id'
    const satisfies = (id: number) => id < 2

    const result = getFromList(list, whereProp, satisfies)

    expect(result).toMatchObject({
      id: 1,
      label: 'First item label'
    })
  })

  it('should return `undefined` with <satisfies> when there is no match', () => {
    const list = [
      {
        id: 1,
        label: 'First item label'
      },
      {
        id: 2,
        label: 'Second item label'
      }
    ]
    const whereProp = 'id'
    const satisfies = (id: number) => id > 2

    const result = getFromList(list, whereProp, satisfies)

    expect(result).toBeUndefined()
  })
})

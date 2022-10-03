/* eslint-disable @typescript-eslint/naming-convention */

import { expect } from '@jest/globals'

import { hasInList } from '../hasInList'

describe('utils/hasInList()', () => {
  it('should return `true` with <equals> when there is a match', () => {
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

    const result = hasInList(list, whereProp, equals)

    expect(result).toStrictEqual(true)
  })

  it('should return `false` with <equals> when there is no match', () => {
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

    const result = hasInList(list, whereProp, equals)

    expect(result).toStrictEqual(false)
  })

  it('should return `true` with <satisfies> when there is a match', () => {
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

    const result = hasInList(list, whereProp, satisfies)

    expect(result).toStrictEqual(true)
  })

  it('should return `false` with <satisfies> when there is no match', () => {
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

    const result = hasInList(list, whereProp, satisfies)

    expect(result).toStrictEqual(false)
  })
})

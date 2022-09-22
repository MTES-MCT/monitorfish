import { expect } from '@jest/globals'

import { deleteListItems } from '../deleteListItems'

describe('utils/deleteListItems()', () => {
  it('should return the expected updated list with <equals>', () => {
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
    const equals = 2

    const result = deleteListItems(list, whereProp, equals)

    expect(result).toMatchObject([
      {
        id: 1,
        label: 'First item label'
      }
    ])
  })

  it('should return the expected updated list with <satisfies>', () => {
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

    const result = deleteListItems(list, whereProp, satisfies)

    expect(result).toMatchObject([
      {
        id: 2,
        label: 'Second item label'
      }
    ])
  })
})

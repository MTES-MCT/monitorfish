import { expect } from '@jest/globals'

import { updateListItemsProp } from '../updateListItemsProp'

describe('utils/updateListItemsProp()', () => {
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
    const set = {
      label: 'New second item label'
    }

    const result = updateListItemsProp(list, whereProp, equals, set)

    expect(result).toMatchObject([
      {
        id: 1,
        label: 'First item label'
      },
      {
        id: 2,
        label: 'New second item label'
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
    const set = {
      label: 'New first item label'
    }

    const result = updateListItemsProp(list, whereProp, satisfies, set)

    expect(result).toMatchObject([
      {
        id: 1,
        label: 'New first item label'
      },
      {
        id: 2,
        label: 'Second item label'
      }
    ])
  })
})

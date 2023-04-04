import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { useTable } from '..'

import type { CollectionItem } from '../../../types'
import type { TableOptions } from '../types'

// TODO Since it's just a bootstrap, only the most basic tests are implemented but we need more.
describe('hooks/useTable()', () => {
  it('should return an empty array with an empty collection and no column', () => {
    const rawData: CollectionItem[] = []
    const tableOptions: TableOptions<any> = {
      columns: []
    }

    const { result } = renderHook(() => useTable(rawData, tableOptions, []))

    expect(result.current.tableAugmentedData).toMatchObject([])
  })

  it('should return the expected augmented data from simple queries with untransformed columns', () => {
    const rawData: CollectionItem[] = [
      { id: '1', title: 'First Item' },
      { id: '2', title: 'Second Item' },
      { id: '12', title: 'Twelfth Item' },
      { id: '123', title: 'Hundred and twenty-third Item' }
    ]
    const tableOptions: TableOptions<any> = {
      columns: [
        {
          key: 'id',
          label: 'ID'
        }
      ],
      searchableKeys: ['id']
    }

    const { result: firstResult } = renderHook(() => useTable(rawData, tableOptions, [], '12'))

    expect(firstResult.current.tableAugmentedData).toMatchObject([
      {
        id: '12',
        isChecked: false,
        item: {
          id: '12',
          title: 'Twelfth Item'
        },
        labelled: {
          id: '12'
        },
        searchable: {
          id: '12'
        },
        sortable: {}
      },
      {
        id: '123',
        isChecked: false,
        item: {
          id: '123',
          title: 'Hundred and twenty-third Item'
        },
        labelled: {
          id: '123'
        },
        searchable: {
          id: '123'
        },
        sortable: {}
      }
    ])

    const { result: secondResult } = renderHook(() => useTable(rawData, tableOptions, [], '23'))

    expect(secondResult.current.tableAugmentedData).toMatchObject([
      {
        id: '123',
        isChecked: false,
        item: {
          id: '123',
          title: 'Hundred and twenty-third Item'
        },
        labelled: {
          id: '123'
        },
        searchable: {
          id: '123'
        },
        sortable: {}
      }
    ])

    const { result: thirdResult } = renderHook(() => useTable(rawData, tableOptions, [], '1 2'))

    expect(thirdResult.current.tableAugmentedData).toMatchObject([
      {
        id: '12',
        isChecked: false,
        item: {
          id: '12',
          title: 'Twelfth Item'
        },
        labelled: {
          id: '12'
        },
        searchable: {
          id: '12'
        },
        sortable: {}
      },
      {
        id: '123',
        isChecked: false,
        item: {
          id: '123',
          title: 'Hundred and twenty-third Item'
        },
        labelled: {
          id: '123'
        },
        searchable: {
          id: '123'
        },
        sortable: {}
      }
    ])
  })
})

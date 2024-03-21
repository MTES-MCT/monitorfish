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

    expect(result.current.tableData).toMatchObject([])
  })

  it('should return the expected augmented data from simple queries with untransformed columns', () => {
    const rawData: CollectionItem[] = [
      { id: '1', title: 'First MissionAction' },
      { id: '2', title: 'Second MissionAction' },
      { id: '12', title: 'Twelfth MissionAction' },
      { id: '123', title: 'Hundred and twenty-third MissionAction' }
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

    expect(firstResult.current.tableData).toMatchObject([
      {
        $isChecked: false,
        $labelled: {
          id: '12'
        },
        $searchable: {
          id: '12'
        },
        $sortable: {},
        id: '12',
        title: 'Twelfth MissionAction'
      },
      {
        $isChecked: false,
        $labelled: {
          id: '123'
        },
        $searchable: {
          id: '123'
        },
        $sortable: {},
        id: '123',
        title: 'Hundred and twenty-third MissionAction'
      }
    ])

    const { result: secondResult } = renderHook(() => useTable(rawData, tableOptions, [], '23'))

    expect(secondResult.current.tableData).toMatchObject([
      {
        $isChecked: false,
        $labelled: {
          id: '123'
        },
        $searchable: {
          id: '123'
        },
        $sortable: {},
        id: '123',
        title: 'Hundred and twenty-third MissionAction'
      }
    ])

    const { result: thirdResult } = renderHook(() => useTable(rawData, tableOptions, [], '1 2'))

    expect(thirdResult.current.tableData).toMatchObject([
      {
        $isChecked: false,
        $labelled: {
          id: '12'
        },
        $searchable: {
          id: '12'
        },
        $sortable: {},
        id: '12',
        title: 'Twelfth MissionAction'
      },
      {
        $isChecked: false,
        $labelled: {
          id: '123'
        },
        $searchable: {
          id: '123'
        },
        $sortable: {},
        id: '123',
        title: 'Hundred and twenty-third MissionAction'
      }
    ])
  })
})

import diacritics from 'diacritics'
import Fuse from 'fuse.js'
import { get, orderBy } from 'lodash'
import { assocPath, equals, path, pipe, propEq } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TableHead } from './TableHead'
import { getArrayPathFromStringPath, normalizeSearchQuery } from './utils'

import type { FilterFunction, TableItem, TableOptions } from './types'
import type { CollectionItem } from '../../types'

export function useTable<T extends CollectionItem = CollectionItem>(
  maybeRawData: T[] | undefined,
  {
    columns,
    defaultSortedKey,
    isCheckable,
    isDefaultSortingDesc,
    searchableKeys = [],
    searchFuseOptions = {}
  }: TableOptions<T>,
  filterFunctions: FilterFunction<T>[],
  searchQuery?: string
) {
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [isSortingDesc, setIsSortingDesc] = useState(Boolean(isDefaultSortingDesc))
  const [sortingKey, setSortingKey] = useState<string | undefined>(defaultSortedKey)
  const [sortingFallbackKey, setSortingFallbackKey] = useState<string | undefined>(undefined)

  const rawData = useMemo(() => maybeRawData || [], [maybeRawData])

  const attachIsCheckedProps = useMemo(
    () => columns.map(() => (dataItem: T) => assocPath(['$isChecked'], checkedIds.includes(dataItem.id), dataItem)),
    [checkedIds, columns]
  )

  const attachLabelProps = useMemo(
    () =>
      columns.map(({ key, labelTransform, transform }) => {
        const keyAsArrayPath = getArrayPathFromStringPath(key)
        const maybeLabelTransform = labelTransform || transform

        return (rawItem: T) =>
          assocPath(
            ['$labelled', ...keyAsArrayPath],
            maybeLabelTransform ? maybeLabelTransform(rawItem as any) : path(keyAsArrayPath, rawItem),
            rawItem
          )
      }),
    [columns]
  )

  const attachSearchableProps = useMemo(
    () =>
      searchableKeys.map(key => {
        const keyAsArrayPath = getArrayPathFromStringPath(key)
        const maybeColumn = columns.find(propEq(key, 'key'))
        const maybeSearchTransform = maybeColumn && (maybeColumn.searchTransform || maybeColumn.transform)

        return (rawItem: T) => {
          const searchableValue = maybeSearchTransform
            ? maybeSearchTransform(rawItem as any)
            : path(keyAsArrayPath, rawItem)

          const normalizedSearchableValue = diacritics.remove(String(searchableValue))

          return assocPath(['$searchable', ...keyAsArrayPath], normalizedSearchableValue, rawItem)
        }
      }),
    [columns, searchableKeys]
  )

  const attachSortableProps = useMemo(
    () =>
      columns
        .filter(({ isSortable }) => Boolean(isSortable))
        .map(({ key, sortingTransform, transform }) => {
          const keyAsArrayPath = getArrayPathFromStringPath(key)
          const maybeSortingTransform = sortingTransform || transform

          return (rawItem: T) =>
            assocPath(
              ['$sortable', ...keyAsArrayPath],
              maybeSortingTransform ? maybeSortingTransform(rawItem as any) : path(keyAsArrayPath, rawItem),
              rawItem
            )
        }),
    [columns]
  )

  const tableData = useMemo(() => {
    const tableDataBase: TableItem<T>[] = rawData.map(rawDataItem => ({
      ...rawDataItem,
      $isChecked: false,
      $labelled: {},
      $searchable: {},
      $sortable: {}
    }))

    const tasks = [...attachIsCheckedProps, ...attachLabelProps, ...attachSearchableProps, ...attachSortableProps]
    if (!tasks.length) {
      return tableDataBase
    }

    return tableDataBase.map(
      // @ts-ignore
      pipe(...attachIsCheckedProps, ...attachLabelProps, ...attachSearchableProps, ...attachSortableProps)
    ) as unknown as Array<TableItem<T>>
  }, [attachIsCheckedProps, attachLabelProps, attachSearchableProps, attachSortableProps, rawData])

  const filteredTableData: TableItem<T>[] = useMemo(
    // @ts-ignore
    () => (filterFunctions.length ? (pipe(...filterFunctions)(tableData) as any) : tableData),
    [filterFunctions, tableData]
  )

  // TODO It may make sense to create a separate reusable hook for searc that would generate a FilterFunction.
  // We could then pass it among the `filterFunctions` prop
  const fuse = useMemo(
    () =>
      new Fuse(tableData, {
        ignoreLocation: true,
        keys: columns.map(({ key }) => `$searchable.${key}`),
        useExtendedSearch: true,
        ...searchFuseOptions
      }),
    [tableData, columns, searchFuseOptions]
  )

  const filteredAndSearchedTableData = useMemo(() => {
    const normalizedSearchQuery = normalizeSearchQuery(searchQuery)

    return normalizedSearchQuery
      ? fuse.search<TableItem<T>>(normalizedSearchQuery).map(({ item }) => item)
      : filteredTableData
  }, [filteredTableData, fuse, searchQuery])

  const filteredCheckedIds = useMemo(() => {
    const filteredDataIds = filteredAndSearchedTableData.map(
      filteredAndSearchedTableItem => filteredAndSearchedTableItem.id
    )

    return checkedIds.filter(checkedId => filteredDataIds.includes(checkedId))
  }, [checkedIds, filteredAndSearchedTableData])

  const isAllChecked = useMemo(
    () => filteredCheckedIds.length > 0 && filteredCheckedIds.length === filteredTableData.length,
    [filteredTableData, filteredCheckedIds]
  )

  const filteredAndSearchedAndSortedTableData = useMemo(() => {
    if (!sortingKey) {
      return filteredAndSearchedTableData
    }

    return orderBy(
      filteredAndSearchedTableData,
      item => {
        const value = get(item, sortingKey)
        if (value !== undefined) {
          return value
        }

        if (!sortingFallbackKey) {
          return undefined
        }

        return get(item, sortingFallbackKey)
      },
      isSortingDesc ? ['desc'] : ['asc']
    )
  }, [filteredAndSearchedTableData, isSortingDesc, sortingKey, sortingFallbackKey])

  const getCheckedData = useCallback(
    () => filteredAndSearchedAndSortedTableData.filter(({ id }) => checkedIds.includes(id)),
    [checkedIds, filteredAndSearchedAndSortedTableData]
  )

  const toggleCheckAll = useCallback(() => {
    setCheckedIds(isAllChecked ? [] : filteredAndSearchedAndSortedTableData.map(({ id }) => id).sort())
  }, [filteredAndSearchedAndSortedTableData, isAllChecked])

  const sortColumn = useCallback((key: string, isDesc: boolean, fallbackKey: string | undefined) => {
    setSortingKey(key)
    setSortingFallbackKey(fallbackKey)
    setIsSortingDesc(isDesc)
  }, [])

  const renderTableHead = useCallback(
    () => (
      <TableHead
        columns={columns as any}
        isAllChecked={isAllChecked}
        isCheckable={isCheckable}
        isSortingDesc={isSortingDesc}
        onAllCheckChange={toggleCheckAll}
        onSort={sortColumn}
        sortingKey={sortingKey}
      />
    ),
    [columns, toggleCheckAll, isAllChecked, isCheckable, isSortingDesc, sortColumn, sortingKey]
  )

  const toggleTableCheckForId = useCallback(
    (id: number | string) => {
      if (checkedIds.includes(id)) {
        setCheckedIds(checkedIds.filter(checkedId => checkedId !== id).sort())

        return
      }

      setCheckedIds(checkedIds.concat(id).sort())
    },
    [checkedIds]
  )

  // TODO Check if there is not a better pattern to avoid this `useEffect()`.
  useEffect(() => {
    if (equals(checkedIds, filteredCheckedIds)) {
      return
    }

    setCheckedIds(filteredCheckedIds)
  }, [checkedIds, filteredCheckedIds])

  return {
    getTableCheckedData: getCheckedData,
    renderTableHead,
    tableCheckedIds: filteredCheckedIds,
    tableData: filteredAndSearchedAndSortedTableData,
    toggleTableAllCheck: toggleCheckAll,
    toggleTableCheckForId
  }
}

import diacritics from 'diacritics'
import Fuse from 'fuse.js'
import { ascend, assocPath, descend, equals, path, pipe, propEq, sort } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TableHead } from './TableHead'
import { getArrayPathFromStringPath, normalizeSearchQuery } from './utils'

import type { TableItem, FilterFunction, TableOptions } from './types'
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
        const maybeColumn = columns.find(propEq('key', key))
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

    const sortingKeyPath = path(['sortable', sortingKey]) as any
    const bySortingKey = isSortingDesc ? descend(sortingKeyPath) : ascend(sortingKeyPath)

    return sort(bySortingKey, filteredAndSearchedTableData)
  }, [filteredAndSearchedTableData, isSortingDesc, sortingKey])

  const filteredAndSearchedAndSortedData = useMemo(
    () => filteredAndSearchedAndSortedTableData.map(({ item }) => item),
    [filteredAndSearchedAndSortedTableData]
  )

  const getCheckedData = useCallback(
    () => filteredAndSearchedAndSortedData.filter(({ id }) => checkedIds.includes(id)),
    [checkedIds, filteredAndSearchedAndSortedData]
  )

  const toggleCheckAll = useCallback(() => {
    setCheckedIds(isAllChecked ? [] : filteredAndSearchedAndSortedTableData.map(({ id }) => id).sort())
  }, [filteredAndSearchedAndSortedTableData, isAllChecked])

  const sortColumn = useCallback((key: string, isDesc: boolean) => {
    setSortingKey(key)
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

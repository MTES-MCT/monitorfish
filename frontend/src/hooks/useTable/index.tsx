import diacritics from 'diacritics'
import Fuse from 'fuse.js'
import { ascend, assocPath, descend, equals, path, pipe, propEq, sort } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TableHead } from './TableHead'
import { getArrayPathFromStringPath, normalizeSearchQuery } from './utils'

import type { AugmentedDataFilter, AugmentedDataItem, AugmentedDataItemBase, TableOptions } from './types'
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
  filters: Array<AugmentedDataFilter<T>>,
  searchQuery?: string
) {
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [isSortingDesc, setIsSortingDesc] = useState(Boolean(isDefaultSortingDesc))
  const [sortingKey, setSortingKey] = useState<string | undefined>(defaultSortedKey)

  const rawData = useMemo(() => maybeRawData || [], [maybeRawData])

  const attachIsCheckedProps = useMemo(
    () =>
      columns.map(
        () => (dataItem: AugmentedDataItemBase<T>) =>
          assocPath(['isChecked'], checkedIds.includes(dataItem.id), dataItem)
      ),
    [checkedIds, columns]
  )

  const attachLabelProps = useMemo(
    () =>
      columns.map(({ key, labelTransform, transform }) => {
        const keyAsArrayPath = getArrayPathFromStringPath(key)
        const maybeLabelTransform = labelTransform || transform

        return (augmentedDataItem: AugmentedDataItemBase<T>) =>
          assocPath(
            ['labelled', ...keyAsArrayPath],
            maybeLabelTransform
              ? maybeLabelTransform(augmentedDataItem.item)
              : path(keyAsArrayPath, augmentedDataItem.item),
            augmentedDataItem
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

        return (augmentedDataItem: AugmentedDataItemBase<T>) => {
          const searchableValue = maybeSearchTransform
            ? maybeSearchTransform(augmentedDataItem.item)
            : path(keyAsArrayPath, augmentedDataItem.item)

          const normalizedSearchableValue = diacritics.remove(String(searchableValue))

          return assocPath(['searchable', ...keyAsArrayPath], normalizedSearchableValue, augmentedDataItem)
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

          return (augmentedDataItem: AugmentedDataItemBase<T>) =>
            assocPath(
              ['sortable', ...keyAsArrayPath],
              maybeSortingTransform
                ? maybeSortingTransform(augmentedDataItem.item)
                : path(keyAsArrayPath, augmentedDataItem.item),
              augmentedDataItem
            )
        }),
    [columns]
  )

  const augmentedData = useMemo(() => {
    const augmentedDataBase: Array<AugmentedDataItem<T>> = rawData.map(rawDataItem => ({
      id: rawDataItem.id,
      isChecked: false,
      item: rawDataItem,
      labelled: {},
      searchable: {},
      sortable: {}
    }))

    const tasks = [...attachIsCheckedProps, ...attachLabelProps, ...attachSearchableProps, ...attachSortableProps]
    if (!tasks.length) {
      return augmentedDataBase
    }

    return augmentedDataBase.map(
      // @ts-ignore
      pipe(...attachIsCheckedProps, ...attachLabelProps, ...attachSearchableProps, ...attachSortableProps)
    ) as unknown as Array<AugmentedDataItem<T>>
  }, [attachIsCheckedProps, attachLabelProps, attachSearchableProps, attachSortableProps, rawData])

  const filteredAugmentedData = useMemo(
    () =>
      filters.length > 0
        ? (pipe as (...args: Array<AugmentedDataFilter<T>>) => AugmentedDataFilter<T>)(...filters)(augmentedData)
        : augmentedData,
    [filters, augmentedData]
  )

  // TODO It may make sense to create a separate reusable hook for search.
  const fuse = useMemo(
    () =>
      new Fuse(augmentedData, {
        ignoreLocation: true,
        keys: columns.map(({ key }) => `searchable.${key}`),
        useExtendedSearch: true,
        ...searchFuseOptions
      }),
    [augmentedData, columns, searchFuseOptions]
  )

  const filteredAndSearchedAugmentedData = useMemo(() => {
    const normalizedSearchQuery = normalizeSearchQuery(searchQuery)

    return normalizedSearchQuery
      ? fuse.search<AugmentedDataItem<T>>(normalizedSearchQuery).map(({ item }) => item)
      : filteredAugmentedData
  }, [filteredAugmentedData, fuse, searchQuery])

  const filteredCheckedIds = useMemo(() => {
    const filteredDataIds = filteredAndSearchedAugmentedData.map(
      filteredAndSearchedAugmentedDataItem => filteredAndSearchedAugmentedDataItem.id
    )

    return checkedIds.filter(checkedId => filteredDataIds.includes(checkedId))
  }, [checkedIds, filteredAndSearchedAugmentedData])

  const isAllChecked = useMemo(
    () => filteredCheckedIds.length > 0 && filteredCheckedIds.length === filteredAugmentedData.length,
    [filteredAugmentedData, filteredCheckedIds]
  )

  const filteredAndSearchedAndSortedAugmentedData = useMemo(() => {
    if (!sortingKey) {
      return filteredAndSearchedAugmentedData
    }

    const sortingKeyPath = path(['sortable', sortingKey]) as any
    const bySortingKey = isSortingDesc ? descend(sortingKeyPath) : ascend(sortingKeyPath)

    return sort(bySortingKey, filteredAndSearchedAugmentedData)
  }, [filteredAndSearchedAugmentedData, isSortingDesc, sortingKey])

  const filteredAndSearchedAndSortedData = useMemo(
    () => filteredAndSearchedAndSortedAugmentedData.map(({ item }) => item),
    [filteredAndSearchedAndSortedAugmentedData]
  )

  const getCheckedData = useCallback(
    () => filteredAndSearchedAndSortedData.filter(({ id }) => checkedIds.includes(id)),
    [checkedIds, filteredAndSearchedAndSortedData]
  )

  const toggleCheckAll = useCallback(() => {
    setCheckedIds(isAllChecked ? [] : filteredAndSearchedAndSortedAugmentedData.map(({ id }) => id).sort())
  }, [filteredAndSearchedAndSortedAugmentedData, isAllChecked])

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
    tableAugmentedData: filteredAndSearchedAndSortedAugmentedData,
    tableCheckedIds: filteredCheckedIds,
    tableData: filteredAndSearchedAndSortedData,
    toggleTableAllCheck: toggleCheckAll,
    toggleTableCheckForId
  }
}

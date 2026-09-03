import { ResetButton } from '@components/ResetButton'
import { INITIAL_STATE } from '@features/Mission/components/MissionList/slice'
import { SingleTag } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { type ReactNode, useCallback, useMemo } from 'react'
import styled from 'styled-components'

const DEFAULT_IGNORED_FILTER_KEYS: string[] = []

type FormikFilterTagBarProps = {
  children: ReactNode
  filterLabelEnums: Record<string, Record<string, string> | undefined>
  ignoredFilterKeys?: string[]
  isResetLinkDisplayed?: boolean
}
export function FormikFilterTagBar({
  children,
  filterLabelEnums,
  ignoredFilterKeys = DEFAULT_IGNORED_FILTER_KEYS,
  isResetLinkDisplayed
}: FormikFilterTagBarProps) {
  const {
    setFieldValue: setFilterValue,
    setValues: setFilterValues,
    values: filterValues
  } = useFormikContext<Record<string, string | string[]>>()

  const remove = useCallback(
    (key: string, offValue: string) => {
      const filterValue = filterValues[key]

      if (!filterValue) {
        throw new Error('`filterValue` is undefined.')
      }

      const nextFilterValue = Array.isArray(filterValue) ? filterValue.filter(value => value !== offValue) : undefined
      const normalizedNextFilterValue =
        Array.isArray(nextFilterValue) && !nextFilterValue.length ? undefined : nextFilterValue

      setFilterValue(key, normalizedNextFilterValue)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterValues]
  )

  const removeAll = useCallback(
    () => {
      setFilterValues(INITIAL_STATE.listFilterValues)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterValues]
  )

  const filterTags = useMemo(
    () =>
      Object.keys(filterValues)
        .filter(key => !ignoredFilterKeys.includes(key))
        .flatMap(key => {
          const filterLabelEnum = filterLabelEnums[key]

          const filterValue: string | string[] | undefined = filterValues[key]
          if (!filterValue) {
            return []
          }

          return Array.isArray(filterValue) ? (
            filterValue.map(value => (
              <SingleTag key={`${key}.${value}`} onDelete={() => remove(key, value)}>
                {String(filterLabelEnum ? filterLabelEnum[value] : value)}
              </SingleTag>
            ))
          ) : (
            <SingleTag key={key} onDelete={() => remove(key, filterValue)}>
              {String(filterLabelEnum ? filterLabelEnum[filterValue] : filterValue)}
            </SingleTag>
          )
        }),
    [filterValues, ignoredFilterKeys, filterLabelEnums, remove]
  )

  if (!filterTags.length && !children) {
    return <></>
  }

  return (
    <>
      <Row data-cy="mission-list-filter-tags">
        {children}

        {filterTags}
        {(!!filterTags.length || !!isResetLinkDisplayed) && (
          <ResetFilters>
            <ResetButton data-cy="missions-reset-filters" onClick={removeAll} />
          </ResetFilters>
        )}
      </Row>
    </>
  )
}

const ResetFilters = styled.div`
  height: 24px;
`

const Row = styled.div`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;

  > div,
  > .Field-DateRangePicker {
    margin: 0 24px 0 0;
  }
`

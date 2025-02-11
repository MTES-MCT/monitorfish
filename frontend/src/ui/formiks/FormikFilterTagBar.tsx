import { INITIAL_STATE } from '@features/Mission/components/MissionList/slice'
import { SingleTag, Icon } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useCallback, useMemo, type ReactNode } from 'react'
import styled from 'styled-components'

type FormikFilterTagBarProps = {
  children: ReactNode
  filterLabelEnums: Record<string, Record<string, string> | undefined>
  ignoredFilterKeys?: string[]
  isResetLinkDisplayed?: boolean
}
export function FormikFilterTagBar({
  children,
  filterLabelEnums,
  ignoredFilterKeys = [],
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
        .map(key => {
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
        })
        .flat(),
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
            {/* TODO Use `<Button accent={Accent.LINK} />` once available in Monitor UI. */}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link data-cy="missions-reset-filters" onClick={removeAll}>
              <Icon.Reset size={14} /> Réinitialiser les filtres
            </Link>
          </ResetFilters>
        )}
      </Row>
    </>
  )
}

const ResetFilters = styled.div`
  height: 24px;

  .Element-IconBox {
    margin-right: 4px;
  }
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

const Link = styled.a`
  align-items: end;
  color: ${p => p.theme.color.charcoal};
  cursor: pointer;
  display: inline-flex;
  text-decoration: underline;
`

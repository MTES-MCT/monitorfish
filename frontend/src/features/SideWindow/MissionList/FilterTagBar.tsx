import { SingleTag } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { MissionFilterType } from './types'
import { FrontendError } from '../../../libs/FrontendError'

type FilterTagBarProps = {
  labelEnumerators: Record<string, Record<string, string> | undefined>
}
export function FilterTagBar({ labelEnumerators }: FilterTagBarProps) {
  const {
    setFieldValue: setFilterValue,
    setValues: setFilterValues,
    values: filterValues
  } = useFormikContext<Record<string, string | string[]>>()

  const remove = useCallback(
    (key: string, offValue: string) => {
      const filterValue = filterValues[key]

      if (!filterValue) {
        throw new FrontendError('`filterValue` is undefined.')
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
      setFilterValues({})
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterValues]
  )

  const filterTags = useMemo(
    () =>
      Object.keys(filterValues)
        .filter(
          key => ![MissionFilterType.CUSTOM_DATE_RANGE, MissionFilterType.DATE_RANGE].includes(key as MissionFilterType)
        )
        .map(key => {
          const labelEnumerator = labelEnumerators[key]

          const filterValue: string | string[] | undefined = filterValues[key]
          if (!filterValue) {
            return []
          }

          return Array.isArray(filterValue) ? (
            filterValue.map(value => (
              <SingleTag key={`${key}.${value}`} onDelete={() => remove(key, value)}>
                {String(labelEnumerator ? labelEnumerator[value] : value)}
              </SingleTag>
            ))
          ) : (
            <SingleTag key={key} onDelete={() => remove(key, filterValue)}>
              {String(labelEnumerator ? labelEnumerator[filterValue] : filterValue)}
            </SingleTag>
          )
        })
        .flat(),
    [filterValues, labelEnumerators, remove]
  )

  if (!filterTags.length) {
    return <></>
  }

  return (
    <>
      <Row>{filterTags}</Row>

      <Row>
        {/* TODO Use `<Button accent={Accent.LINK} />` once available in Monitor UI. */}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link onClick={removeAll}>Réinitialiser les filtres</Link>
      </Row>
    </>
  )
}

const Row = styled.div`
  display: flex;
  margin-top: 12px;

  > div:not(:first-child) {
    margin-left: 24px;
  }
`

const Link = styled.a`
  align-items: center;
  color: ${p => p.theme.color.charcoal};
  cursor: pointer;
  display: inline-flex;
  text-decoration: underline;

  > span {
    line-height: 1;
    margin: -2px 0 0 8px;
  }
`

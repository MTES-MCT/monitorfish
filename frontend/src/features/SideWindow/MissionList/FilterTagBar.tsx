import { SingleTag } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { FrontendError } from '../../../libs/FrontendError'

type FilterTagBarProps = {
  labelEnumerators: Record<string, Record<string, string> | undefined>
}
export function FilterTagBar({ labelEnumerators }: FilterTagBarProps) {
  const { setFieldValue, setValues, values: formValues } = useFormikContext<Record<string, string | string[]>>()

  const remove = useCallback(
    (key: string, offValue: string) => {
      const currentKeyValueOrValues = formValues[key]

      if (!currentKeyValueOrValues) {
        throw new FrontendError('`currentKeyValueOrValues` is undefined.')
      }

      const nextValueOrValues = Array.isArray(currentKeyValueOrValues)
        ? currentKeyValueOrValues.filter(value => value !== offValue)
        : undefined
      const normalizedNextValueOrValues =
        Array.isArray(nextValueOrValues) && !nextValueOrValues.length ? undefined : nextValueOrValues

      setFieldValue(key, normalizedNextValueOrValues)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formValues]
  )

  const removeAll = useCallback(
    () => {
      setValues({})
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formValues]
  )

  const filterTags = useMemo(
    () =>
      Object.keys(formValues)
        .map(key => {
          const labelEnumerator = labelEnumerators[key]

          const valueOrValues: string | string[] | undefined = formValues[key]
          if (!valueOrValues) {
            return []
          }

          return Array.isArray(valueOrValues) ? (
            valueOrValues.map(value => (
              <SingleTag key={`${key}.${value}`} onDelete={() => remove(key, value)}>
                {String(labelEnumerator ? labelEnumerator[value] : value)}
              </SingleTag>
            ))
          ) : (
            <SingleTag key={key} onDelete={() => remove(key, valueOrValues)}>
              {String(labelEnumerator ? labelEnumerator[valueOrValues] : valueOrValues)}
            </SingleTag>
          )
        })
        .flat(),
    [formValues, labelEnumerators, remove]
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

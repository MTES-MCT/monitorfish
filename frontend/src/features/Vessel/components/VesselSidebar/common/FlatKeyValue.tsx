import { type ForwardedRef, forwardRef, type ReactElement } from 'react'
import styled from 'styled-components'

type KeyValue = {
  hasMultipleLines?: boolean
  key: string
  value: boolean | string | number | undefined | ReactElement
}

type KeyValueTableProps = {
  className?: string | undefined
  column: Array<KeyValue>
  keyWidth?: number | undefined
  valueEllipsisedForWidth?: number | undefined
}
function FlatKeyValueWithRef(
  { className, column, keyWidth, valueEllipsisedForWidth }: KeyValueTableProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <Zone ref={ref ?? undefined} className={className}>
      <Fields>
        <TableBody>
          {column.map(({ hasMultipleLines, key, value }) => (
            <Field key={key}>
              <Key $width={keyWidth}>{key}</Key>
              {value ? (
                <Value
                  $hasMultipleLines={!!hasMultipleLines}
                  $valueEllipsisedForWidth={valueEllipsisedForWidth}
                  data-cy={key}
                  title={typeof value !== 'object' ? value?.toString() : undefined}
                >
                  {value}
                </Value>
              ) : (
                <NoValue>-</NoValue>
              )}
            </Field>
          ))}
        </TableBody>
      </Fields>
    </Zone>
  )
}

export const FlatKeyValue = forwardRef<HTMLDivElement, KeyValueTableProps>(FlatKeyValueWithRef)

const TableBody = styled.tbody``

const Zone = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
`

const Fields = styled.table<{
  isSecondColumn?: boolean
}>`
  margin: 8px 8px 8px 16px;
  display: table;
  min-width: 40%;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th<{
  $width?: number | undefined
}>`
  color: ${p => p.theme.color.slateGray};
  padding: 1px 5px 5px 0;
  line-height: 0.5em;
  font-weight: normal;
  width: ${p => (p.$width ? `${p.$width}px` : 'max-content')};
  text-align: left;
`

const Value = styled.td<{
  $hasMultipleLines: boolean
  $valueEllipsisedForWidth: number | undefined
}>`
  color: ${p => p.theme.color.gunMetal};
  padding: 1px 5px 5px 5px;
  line-height: normal;
  ${p => {
    if (p.$hasMultipleLines) {
      return null
    }

    if (p.$valueEllipsisedForWidth === undefined) {
      return null
    }

    return (
      `text-overflow: ellipsis;` +
      `overflow: hidden !important;` +
      `white-space: nowrap;` +
      `max-width: ${p.$valueEllipsisedForWidth}px;`
    )
  }}
  height: 19px;
  font-weight: 500;
`

const NoValue = styled.td`
  padding: 1px 5px 5px 5px;
  line-height: normal;
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
`

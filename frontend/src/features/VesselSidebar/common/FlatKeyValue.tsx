import styled from 'styled-components'

type KeyValue = {
  key: string
  value: boolean | string | number | undefined
}

type KeyValueTableProps = {
  className?: string | undefined
  column: Array<KeyValue>
  valueEllipsisedForWidth?: number | undefined
}
export function FlatKeyValue({ className, column, valueEllipsisedForWidth }: KeyValueTableProps) {
  return (
    <Zone className={className}>
      <Fields>
        <TableBody>
          {column.map(({ key, value }) => (
            <Field key={key}>
              <Key>{key}</Key>
              {value ? (
                <Value data-cy={key} title={value?.toString()} valueEllipsisedForWidth={valueEllipsisedForWidth}>
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

const TableBody = styled.tbody``

const Zone = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;
`

const Fields = styled.table<{
  isSecondColumn?: boolean
}>`
  margin: 10px 0px 10px 16px;
  display: table;
  min-width: 40%;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${p => p.theme.color.slateGray};
  flex: initial;
  display: inline-block;
  padding: 1px 5px 5px 0;
  width: max-content;
  line-height: 0.5em;
  font-weight: normal;
`

const Value = styled.td<{
  valueEllipsisedForWidth: number | undefined
}>`
  color: ${p => p.theme.color.gunMetal};
  padding: 1px 5px 5px 5px;
  line-height: normal;
  ${p => {
    if (p.valueEllipsisedForWidth === undefined) {
      return null
    }

    return (
      `text-overflow: ellipsis;` +
      `overflow: hidden !important;` +
      `white-space: nowrap;` +
      `max-width: ${p.valueEllipsisedForWidth}px;`
    )
  }}
  height: 19px;
  font-weight: 400;
`

const NoValue = styled.td`
  padding: 1px 5px 5px 5px;
  line-height: normal;
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

import styled from 'styled-components'

type KeyValue = {
  key: string
  value: boolean | string | number | undefined
}

type KeyValueTableProps = {
  className?: string | undefined
  column: Array<KeyValue>
}
export function FlatKeyValue({ className, column }: KeyValueTableProps) {
  return (
    <Zone className={className}>
      <Fields>
        <TableBody>
          {column.map(({ key, value }) => (
            <Field>
              <Key>{key}</Key>
              {value ? <Value title={value?.toString()}>{value}</Value> : <NoValue>-</NoValue>}
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
  margin: 5px 5px 0px;
  text-align: left;
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

const Value = styled.td`
  color: ${p => p.theme.color.gunMetal};
  padding: 1px 5px 5px 5px;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  height: 19px;
  max-width: 100px;
  font-weight: 500;
`

const NoValue = styled.td`
  padding: 1px 5px 5px 5px;
  line-height: normal;
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

import { range } from 'lodash'
import styled from 'styled-components'

type KeyValue = {
  key: string
  value: boolean | string | number | undefined
}

type KeyValueTableProps = {
  className?: string | undefined
  firstColumn: Array<KeyValue>
  secondColumn: Array<KeyValue>
}
export function FlatTwoColumnKeyValue({ className, firstColumn, secondColumn }: KeyValueTableProps) {
  return (
    <Zone className={className}>
      <Fields>
        <TableBody>
          {firstColumn.map(({ key, value }) => (
            <Field key={key}>
              <Key>{key}</Key>
              {value ? <Value title={value?.toString()}>{value}</Value> : <NoValue>-</NoValue>}
            </Field>
          ))}
        </TableBody>
      </Fields>
      <Fields isSecondColumn>
        <TableBody>
          {secondColumn.map(({ key, value }) => (
            <Field key={key}>
              <Key>{key}</Key>
              {value ? <Value title={value?.toString()}>{value}</Value> : <NoValue>-</NoValue>}
            </Field>
          ))}
          {/** We add empty item in second column to to not break the first column */}
          {secondColumn.length < firstColumn.length &&
            range(firstColumn.length - secondColumn.length).map(index => (
              <Field key={index}>
                <Key />
                <Value />
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
  flex-wrap: wrap;
  margin: 5px 5px 10px;
  text-align: left;

  > table:not(:first-child) {
    margin-left: 25px;
  }
`

const Fields = styled.table<{
  isSecondColumn?: boolean
}>`
  padding: 10px 5px 5px 20px;
  margin: 10px ${p => (p.isSecondColumn ? 20 : 0)}px 10px ${p => (p.isSecondColumn ? 0 : 20)}px;
  width: inherit;
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

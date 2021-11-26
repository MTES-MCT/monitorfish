import { COLORS } from '../../../constants/constants'
import React from 'react'
import styled from 'styled-components'
import Table from 'rsuite/lib/Table'

const { Cell } = Table
const rowKey = 'id'

export const ExpandCell = ({ rowData, dataKey, expandedRowKeys, onChange, ...props }) => (
  <Cell
    {...props}
    onClick={() => {
      onChange(rowData)
    }}
    style={{
      cursor: 'pointer',
      width: 35,
      fontSize: 19,
      lineHeight: '13px',
      background: COLORS.gainsboro
    }}
  >
    {expandedRowKeys.some((key) => key === rowData[rowKey]) ? '-' : '+'}
  </Cell>
)

export const renderRowExpanded = rowData => {
  return (
    <ExpandedRowWrapper>
      <VerticalBar/>
      <ExpandedRow>
        <Fields>
          <TableBody>
            <Field>
              <Key>Vitesse</Key>
              <Value>{rowData.value.speed || <NoValue>-</NoValue>}</Value>
            </Field>
            <Field>
              <Key>Nb d&apos;incursions</Key>
              <Value>{rowData.value.incursionNumber || <NoValue>-</NoValue>}</Value>
            </Field>
          </TableBody>
        </Fields>
      </ExpandedRow>
    </ExpandedRowWrapper>
  )
}

const ExpandedRow = styled.div`
  background: ${COLORS.background};
  padding: 10px 20px 10px 15px;
`

const ExpandedRowWrapper = styled.div`
  display: flex;
`

const VerticalBar = styled.div`
  height: 62px;
  width: 51px;
  background: ${COLORS.gainsboro};
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 0;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  text-align: left;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

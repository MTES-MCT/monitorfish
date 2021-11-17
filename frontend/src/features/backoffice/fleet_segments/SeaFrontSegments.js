import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import Table from 'rsuite/lib/Table'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/styles/RiskFactorBox.style'

const { Column, HeaderCell, Cell } = Table

const rowKey = 'id'

const SeaFrontSegments = ({ title, data }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [sortColumn, setSortColumn] = React.useState()
  const [sortType, setSortType] = React.useState()

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  const handleExpanded = (rowData, dataKey) => {
    let open = false
    const nextExpandedRowKeys = []

    expandedRowKeys.forEach(key => {
      if (key === rowData[rowKey]) {
        open = true
      } else {
        nextExpandedRowKeys.push(key)
      }
    })

    if (!open) {
      nextExpandedRowKeys.push(rowData[rowKey])
    }

    setExpandedRowKeys(nextExpandedRowKeys)
  }

  return (
    <Wrapper>
      <Title>{title}</Title><br/>
      <Table
        height={data.length * 36 + expandedRowKeys.length * 95 + 60}
        width={443}
        data={data}
        rowKey={rowKey}
        expandedRowKeys={expandedRowKeys}
        onRowClick={(data) => {
          console.log(data)
        }}
        renderRowExpanded={renderRowExpanded}
        rowExpandedHeight={125}
        rowHeight={36}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
        affixHorizontalScrollbar
        locale={{
          emptyMessage: 'Aucun résultat',
          loading: 'Chargement...'
        }}
      >
        <Column width={50} align="center">
          <HeaderCell/>
          <ExpandCell dataKey="id" expandedRowKeys={expandedRowKeys} onChange={handleExpanded} />
        </Column>

        <Column width={100}>
          <HeaderCell>Segment</HeaderCell>
          <Cell dataKey="segment" />
        </Column>

        <Column width={150}>
          <HeaderCell>Nom du segment</HeaderCell>
          <Cell dataKey="segmentName" />
        </Column>

        <Column width={80}>
          <HeaderCell>N. de risque</HeaderCell>
          <Cell dataKey="riskFactor" />
        </Column>

        <Column width={60}>
          <HeaderCell>Priorité</HeaderCell>
          <RiskFactorCell dataKey="priority" />
        </Column>
      </Table>
    </Wrapper>
  )
}

const ExpandCell = ({ rowData, dataKey, expandedRowKeys, onChange, ...props }) => (
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

const RiskFactorCell = ({ rowData, dataKey, expandedRowKeys, onChange, ...props }) => (
  <Cell
    {...props}
  >
    <RiskFactorBox
      height={8}
      color={getRiskFactorColor(rowData?.riskFactor)}
    >
      {rowData?.riskFactor}
    </RiskFactorBox>
  </Cell>
)

const renderRowExpanded = rowData => {
  return (
    <div
      style={{
        float: 'left',
        background: COLORS.background,
        padding: '0 20px 20px 40px'
      }}
    >
      <Fields>
        <TableBody>
          <Field>
            <Key>Engins</Key>
            <Value>{rowData.gears || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Zones FAO</Key>
            <Value>{rowData.gears || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Espèces cibles</Key>
            <Value>{rowData.gears || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Prises accessoires</Key>
            <Value>{rowData.gears || <NoValue>-</NoValue>}</Value>
          </Field>
        </TableBody>
      </Fields>
    </div>
  )
}

const Wrapper = styled.div`
  margin-left: 20px;
`

const Title = styled.h2`
  font-size: 16px;
  color: #282F3E;
  border-bottom: 2px solid #E0E0E0;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
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

export default SeaFrontSegments

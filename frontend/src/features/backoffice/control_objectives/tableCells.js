import InputPicker from 'rsuite/lib/InputPicker'
import { COLORS } from '../../../constants/constants'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import React from 'react'
import styled from 'styled-components'
import Table from 'rsuite/lib/Table'

const { Cell } = Table
const rowKey = 'id'

export const ModifiableCell = ({ rowData, dataKey, onChange, ...props }) => {
  return (
    <Cell key={rowData.id} {...props} className={'table-content-editing'}>
      <input
        style={{ fontSize: 13, marginLeft: -5, marginTop: -8, fontWeight: 500 }}
        type="text"
        maxLength={3}
        className="rs-input"
        value={rowData[dataKey]}
        onChange={event => {
          const value = (event.target.value && !isNaN(parseInt(event.target.value))) ? parseInt(event.target.value) : ''
          onChange && onChange(rowData.id, dataKey, value)
        }}
      />
    </Cell>
  )
}

export const ControlPriorityCell = ({ rowData, dataKey, onChange, ...props }) => {
  return (
    <Cell key={rowData.id} {...props} className={'table-content-editing'}>
      <InputPicker
        value={rowData[dataKey]}
        onChange={value => {
          const controlPriority = (value && !isNaN(parseInt(value))) ? parseInt(value) : ''
          onChange && onChange(rowData.id, dataKey, controlPriority)
        }}
        data={[{ label: 1, value: 1 }, { label: 2, value: 2 }, { label: 3, value: 3 }, { label: 4, value: 4 }]}
        style={{ width: 20 }}
        creatable={false}
        cleanable={false}
        size={'xs'}
      />
    </Cell>
  )
}

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

export const ImpactRiskFactorCell = ({ rowData, expandedRowKeys, onChange, ...props }) =>
  <Cell
    {...props}
    style={{ marginLeft: 13 }}
  >
    <RiskFactorBox
      height={8}
      color={getRiskFactorColor(rowData.impactRiskFactor)}
    >
      {rowData.impactRiskFactor}
    </RiskFactorBox>
  </Cell>

export const renderRowExpanded = rowData => {
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
            <Value>{rowData.gears?.join(', ') || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Zones FAO</Key>
            <Value>{rowData.faoAreas?.join(', ') || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Espèces cibles</Key>
            <Value>{rowData.targetSpecies?.join(', ') || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Prises accessoires</Key>
            <Value>{rowData.bycatchSpecies?.join(', ') || <NoValue>-</NoValue>}</Value>
          </Field>
        </TableBody>
      </Fields>
    </div>
  )
}

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

import React, { useEffect, useRef, useState } from 'react'
import { InputPicker, Table, Tag, TagPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { getRiskFactorColor } from '../../domain/entities/riskFactor'
import { useClickOutsideWhenOpenedAndNotInSelector } from '../../hooks/useClickOutsideWhenOpenedAndNotInSelector'
import { ReactComponent as DeleteIconSVG } from '../icons/Icone_suppression.svg'
import { RiskFactorBox } from '../vessel_sidebar/risk_factor/RiskFactorBox'

const { Cell } = Table
const rowKey = 'id'
export const INPUT_TYPE = {
  DOUBLE: 'DOUBLE',
  INT: 'INT',
  STRING: 'STRING',
}

export function ModifiableCell({ dataKey, id, inputType, maxLength, onChange, rowData, ...props }) {
  return (
    <Cell key={rowData[id]} className="table-content-editing" title={rowData[dataKey]} {...props}>
      <FleetSegmentInput
        dataCy={`row-${rowData[id]}-${dataKey}-${rowData[dataKey]}`}
        dataKey={dataKey}
        id={rowData[id]}
        inputType={inputType}
        maxLength={maxLength}
        onChange={onChange}
        value={rowData[dataKey]}
        withinCell
      />
    </Cell>
  )
}

export function FleetSegmentInput({ dataCy, dataKey, id, inputType, maxLength, onChange, value, withinCell }) {
  return (
    <input
      className="rs-input"
      data-cy={dataCy}
      id={id}
      maxLength={maxLength}
      onChange={event => {
        let value = null
        switch (inputType) {
          case INPUT_TYPE.INT: {
            value = event.target.value && !isNaN(parseInt(event.target.value)) ? parseInt(event.target.value) : 0
            break
          }
          case INPUT_TYPE.DOUBLE: {
            value = event.target.value ? event.target.value : 0.0
            break
          }
          case INPUT_TYPE.STRING: {
            value = event.target.value
            break
          }
        }
        onChange && onChange(id, dataKey, value)
      }}
      style={{
        fontSize: 13,
        fontWeight: 500,
        marginBottom: withinCell ? 0 : 20,
        marginLeft: withinCell ? -7 : 0,
        marginRight: 0,
        marginTop: withinCell ? -8 : 5,
        paddingLeft: 5,
        paddingRight: 10,
      }}
      type="text"
      value={value}
    />
  )
}

export function ControlPriorityCell({ dataKey, onChange, rowData, ...props }) {
  return (
    <Cell key={rowData.id} {...props} className="table-content-editing">
      <InputPicker
        cleanable={false}
        creatable={false}
        data={[
          { label: 1, value: 1 },
          { label: 2, value: 2 },
          { label: 3, value: 3 },
          { label: 4, value: 4 },
        ]}
        onChange={value => {
          const controlPriority = value && !isNaN(parseInt(value)) ? parseInt(value) : ''
          onChange && onChange(rowData.id, dataKey, controlPriority)
        }}
        size="xs"
        style={{ width: 20 }}
        value={rowData[dataKey]}
      />
    </Cell>
  )
}

export function SegmentCellWithTitle({ dataKey, rowData, ...props }) {
  return (
    <Cell
      style={{ background: rowData.segmentName ? 'unset' : COLORS.tumbleweed }}
      title={`Segment ${rowData[dataKey] || 'inconnu'}`}
      {...props}
    >
      {rowData[dataKey]}
    </Cell>
  )
}

export function ExpandCell({ dataKey, expandedRowKeys, onChange, rowData, ...props }) {
  return (
    <Cell
      {...props}
      onClick={() => {
        onChange(rowData)
      }}
      style={{
        background: COLORS.gainsboro,
        cursor: 'pointer',
        fontSize: 19,
        lineHeight: '13px',
        width: 35,
      }}
    >
      {expandedRowKeys.some(key => key === rowData[rowKey]) ? '-' : '+'}
    </Cell>
  )
}

export function ImpactRiskFactorCell({ expandedRowKeys, onChange, rowData, ...props }) {
  return (
    <Cell {...props} style={{ marginLeft: 13 }}>
      <RiskFactorBox color={getRiskFactorColor(rowData.impactRiskFactor)} height={8}>
        {rowData.impactRiskFactor}
      </RiskFactorBox>
    </Cell>
  )
}

/**
 * This component show a list of tag by default and only open the tagPicker if the user click, for performance reason
 * @param rowData
 * @param dataKey
 * @param data
 * @param hasClicked
 * @param onChange
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
export function TagPickerCell({ data, dataKey, id, onChange, rowData, ...props }) {
  const wrapperRef = useRef(null)
  const [isOpened, setIsOpened] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpenedAndNotInSelector(wrapperRef, isOpened, '.rs-picker-menu')

  useEffect(() => {
    setIsOpened(false)
  }, [clickedOutsideComponent])

  return (
    <div ref={wrapperRef}>
      <Cell
        {...props}
        onClick={() => setIsOpened(true)}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={rowData[dataKey]?.join(', ')}
      >
        {isOpened ? (
          <TagPicker
            data={data}
            onChange={value => onChange && onChange(rowData[id], dataKey, value)}
            open={isOpened}
            placeholder=""
            placement="auto"
            renderMenuItem={(_, item) => renderTagPickerMenuItem(onChange, item)}
            renderValue={(_, items) => renderTagPickerValue(items)}
            searchable
            style={tagPickerStyle}
            value={rowData[dataKey]}
            virtualized
          />
        ) : (
          <TagOnly className="rs-picker-tag-wrapper">
            {rowData[dataKey]?.map(tag => (
              <div key={tag} className="rs-tag rs-tag-default">
                <span className="rs-tag-text">{tag}</span>
              </div>
            ))}
          </TagOnly>
        )}
      </Cell>
    </div>
  )
}

export function renderTagPickerMenuItem(onChange, item) {
  return <Label onClick={() => onChange(item.label)}>{item.label}</Label>
}

export function renderTagPickerValue(items) {
  return items.filter(tag => tag).map(tag => <Tag key={tag?.label}>{tag?.label}</Tag>)
}

const TagOnly = styled.div`
  margin: -3px 10px 10px 6px !important;
  vertical-align: top;
`

const Label = styled.span`
  font-size: 13px;
`

const tagPickerStyle = { margin: '2px 10px 10px 0', verticalAlign: 'top', width: 250 }

export const renderRowExpanded = rowData => (
  <div
    style={{
      background: COLORS.background,
      float: 'left',
      padding: '0 20px 20px 40px',
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

export function DeleteCell({ dataKey, id, onClick, rowData, ...props }) {
  return (
    <Cell key={rowData[id]} {...props}>
      <Delete
        data-cy={`delete-row-${rowData[id]}`}
        onClick={() => onClick && onClick(rowData[id], dataKey)}
        title="Supprimer la ligne"
      >
        <DeleteIcon />
      </Delete>
    </Cell>
  )
}

const DeleteIcon = styled(DeleteIconSVG)`
  margin-left: 1px;
  margin-top: 2px;
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

const Delete = styled.div`
  cursor: pointer;
`

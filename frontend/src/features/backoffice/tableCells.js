import InputPicker from 'rsuite/lib/InputPicker'
import { COLORS } from '../../constants/constants'
import { RiskFactorBox } from '../vessel_sidebar/risk_factor/RiskFactorBox'
import { getRiskFactorColor } from '../../domain/entities/riskFactor'
import { ReactComponent as DeleteIconSVG } from '../icons/Icone_suppression.svg'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Table from 'rsuite/lib/Table'
import TagPicker from 'rsuite/lib/TagPicker'
import Tag from 'rsuite/lib/Tag'
import { useClickOutsideWhenOpenedAndNotInSelector } from '../../hooks/useClickOutsideWhenOpenedAndNotInSelector'

const { Cell } = Table
const rowKey = 'id'
export const INPUT_TYPE = {
  STRING: 'STRING',
  INT: 'INT',
  DOUBLE: 'DOUBLE'
}

export const ModifiableCell = ({ rowData, dataKey, id, inputType, maxLength, onChange, ...props }) => {
  return (
    <Cell title={rowData[dataKey]} key={rowData[id]} {...props} className={'table-content-editing'}>
      <input
        style={{
          fontSize: 13,
          marginTop: -8,
          marginLeft: -7,
          marginRight: 0,
          paddingLeft: 5,
          paddingRight: 10,
          fontWeight: 500
        }}
        type="text"
        maxLength={maxLength}
        className="rs-input"
        value={rowData[dataKey]}
        onChange={event => {
          let value = null
          switch (inputType) {
            case INPUT_TYPE.INT: {
              value = (event.target.value && !isNaN(parseInt(event.target.value))) ? parseInt(event.target.value) : 0
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
          onChange && onChange(rowData[id], dataKey, value)
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

export const SegmentCellWithTitle = ({ rowData, dataKey, ...props }) => (
  <Cell
    title={`Segment ${rowData[dataKey] || 'inconnu'}`}
    style={{ background: rowData.segmentName ? 'unset' : COLORS.tumbleweed }}
    {...props}
  >
    {rowData[dataKey]}
  </Cell>
)

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
export const TagPickerCell = ({ rowData, dataKey, data, id, onChange, ...props }) => {
  const wrapperRef = useRef(null)
  const [isOpened, setIsOpened] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpenedAndNotInSelector(wrapperRef, isOpened, '.rs-picker-menu')

  useEffect(() => {
    setIsOpened(false)
  }, [clickedOutsideComponent])

  return <div ref={wrapperRef}>
    <Cell
      {...props}
      style={{
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden'
      }}
      onClick={() => setIsOpened(true)}
      title={rowData[dataKey]?.join(', ')}
    >
      {
        isOpened
          ? <TagPicker
            searchable
            value={rowData[dataKey]}
            style={tagPickerStyle}
            data={data}
            placeholder={''}
            placement={'auto'}
            open={isOpened}
            onChange={value => onChange && onChange(rowData[id], dataKey, value)}
            renderMenuItem={(_, item) => renderTagPickerMenuItem(onChange, item)}
            renderValue={(_, items) => renderTagPickerValue(items)}
          />
          : <TagOnly className="rs-picker-tag-wrapper">
            {
              rowData[dataKey]?.map(tag =>
                <div key={tag} className="rs-tag rs-tag-default">
                  <span className="rs-tag-text">{tag}</span>
                </div>)
            }
          </TagOnly>
      }
    </Cell>
  </div>
}

function renderTagPickerMenuItem (onChange, item) {
  return (
    <Label onClick={() => onChange(item.label)}>
      {item.label}
    </Label>
  )
}

function renderTagPickerValue (items) {
  return items
    .filter(tag => tag)
    .map(tag => (
      <Tag key={tag?.label}>
        {tag?.label}
      </Tag>
    ))
}

const TagOnly = styled.div`
  margin: -3px 10px 10px 6px !important;
  vertical-align: top;
`

const Label = styled.span`
  font-size: 13px;
`

const tagPickerStyle = { width: 250, margin: '2px 10px 10px 0', verticalAlign: 'top' }

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

export const DeleteCell = ({ rowData, dataKey, id, onClick, ...props }) => {
  return (
    <Cell key={rowData[id]} {...props}>
      <Delete
        title={'Supprimer la ligne'}
        data-cy={`delete-row-${rowData[id]}`}
        onClick={() => onClick && onClick(rowData[id], dataKey)}
      >
        <DeleteIcon/>
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

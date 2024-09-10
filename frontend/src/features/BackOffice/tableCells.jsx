import { Accent, Icon, IconButton, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import { SelectPicker, Table } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { getRiskFactorColor } from '../../domain/entities/vessel/riskFactor'
import { theme } from '../../ui/theme'
import { RiskFactorBox } from '../Vessel/components/VesselSidebar/risk_factor/RiskFactorBox'

const { Cell } = Table
const rowKey = 'id'
export const INPUT_TYPE = {
  DOUBLE: 'DOUBLE',
  INT: 'INT',
  STRING: 'STRING'
}

/**
 * @param {*} props
 */
export function ModifiableCell({ afterChange, dataKey, id, inputType, isDisabled, maxLength, onChange, ...props }) {
  const { rowData } = props
  const dataCy = `row-${rowData[id]}-${dataKey}`

  return (
    <ModifiableCellWrapper>
      <Cell key={rowData[id]} className="table-content-editing" title={rowData[dataKey]} {...props}>
        <FleetSegmentInput
          afterChange={afterChange}
          dataCy={dataCy}
          dataKey={dataKey}
          id={rowData[id]}
          inputType={inputType}
          isDisabled={isDisabled}
          maxLength={maxLength}
          onChange={onChange}
          value={rowData[dataKey]}
          withinCell
        />
      </Cell>
    </ModifiableCellWrapper>
  )
}

const ModifiableCellWrapper = styled.div`
  .rs-input:focus {
    background: ${COLORS.charcoal};
    color: ${COLORS.white};
  }

  .rs-input {
    height: 30px;
  }
`

export function FleetSegmentInput({
  afterChange,
  dataCy,
  dataKey,
  id,
  inputType,
  isDisabled,
  maxLength,
  onChange,
  value,
  withinCell
}) {
  const onChangeCallback = useCallback(
    event => {
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
      if (dataKey === 'segment') {
        afterChange && afterChange(dataCy.replaceAll(id, value))
      } else {
        afterChange && afterChange(dataCy)
      }
    },
    [onChange, dataKey, id, afterChange, dataCy]
  )

  return (
    <input
      className="rs-input"
      data-cy={dataCy}
      disabled={isDisabled}
      id={id}
      maxLength={maxLength}
      onChange={event => onChangeCallback(event)}
      style={{
        fontSize: 13,
        fontWeight: 500,
        marginBottom: withinCell ? 0 : 20,
        marginLeft: withinCell ? -7 : 0,
        marginRight: 0,
        marginTop: withinCell ? -8 : 5,
        paddingLeft: 5,
        paddingRight: 10
      }}
      type="text"
      value={value}
    />
  )
}

export function ControlPriorityCell({ dataKey, onChange, ...props }) {
  const { rowData } = props
  const dataCy = `row-${rowData.id}-${dataKey}`

  return (
    <Cell key={rowData.id} {...props} className="table-content-editing">
      <SelectPicker
        cleanable={false}
        creatable={false}
        data={[
          { label: 1, value: 1 },
          { label: 2, value: 2 },
          { label: 3, value: 3 },
          { label: 4, value: 4 }
        ]}
        data-cy={dataCy}
        onChange={value => {
          const controlPriority = value && !isNaN(parseInt(value)) ? parseInt(value) : ''
          onChange && onChange(rowData.id, dataKey, controlPriority)
        }}
        searchable={false}
        size="xs"
        style={{ width: 20 }}
        value={rowData[dataKey]}
      />
    </Cell>
  )
}

/**
 * @param {*} props
 */
export function SegmentCellWithTitle({ dataKey, rowData, ...props }) {
  return (
    <Cell
      style={{ background: rowData.segmentName ? 'unset' : theme.color.goldenPoppy }}
      title={`Segment ${rowData[dataKey] || 'inconnu'}`}
      {...props}
    >
      {rowData[dataKey]}
    </Cell>
  )
}

/**
 * @param {*} props
 */
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
        width: 35
      }}
    >
      {expandedRowKeys.some(key => key === rowData[rowKey]) ? '-' : '+'}
    </Cell>
  )
}

/**
 * @param {*} props
 */
export function ImpactRiskFactorCell({ expandedRowKeys, onChange, rowData, ...props }) {
  return (
    <Cell {...props} style={{ marginLeft: 13 }}>
      <RiskFactorBox color={getRiskFactorColor(rowData.impactRiskFactor)} height={8}>
        {rowData.impactRiskFactor}
      </RiskFactorBox>
    </Cell>
  )
}

export function TagsCell({ data, dataKey, id, ...props }) {
  const { rowData } = props

  return (
    <Wrapper>
      <Cell {...props} title={rowData[dataKey]?.join(', ')}>
        <TagOnly>
          {rowData[dataKey]?.map(tag => (
            <Tag key={tag} backgroundColor={THEME.color.gainsboro}>
              {tag}
            </Tag>
          ))}
        </TagOnly>
      </Cell>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  .rs-table-cell-content {
    padding-left: 5px;
    padding-top: 0px;
  }
`

export function renderTagPickerValue(items) {
  return items.filter(tag => tag).map(tag => <Tag key={tag?.label}>{tag?.label}</Tag>)
}

const TagOnly = styled.div`
  margin: -3px 0px 0px 0px;
  whitespace: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const renderRowExpanded = rowData => (
  <div
    style={{
      background: COLORS.white,
      padding: '0 20px 20px 40px'
    }}
  >
    <Fields>
      <TableBody>
        <tr>
          <Key>Engins</Key>
          <Value>{rowData.gears?.join(', ') || <NoValue>-</NoValue>}</Value>
        </tr>
        <tr>
          <Key>Zones FAO</Key>
          <Value>{rowData.faoAreas?.join(', ') || <NoValue>-</NoValue>}</Value>
        </tr>
        <tr>
          <Key>Espèces cibles</Key>
          <Value>{rowData.targetSpecies?.join(', ') || <NoValue>-</NoValue>}</Value>
        </tr>
        <tr>
          <Key>Prises accessoires</Key>
          <Value>{rowData.bycatchSpecies?.join(', ') || <NoValue>-</NoValue>}</Value>
        </tr>
      </TableBody>
    </Fields>
  </div>
)

export function EditAndDeleteCell({ dataKey, id, onDelete, onEdit, ...props }) {
  const { rowData } = props

  return (
    <Cell key={rowData[id]} {...props} style={{ display: 'flex', padding: '5px 5px' }}>
      <IconButton
        accent={Accent.TERTIARY}
        data-cy={`edit-row-${rowData[id]}`}
        Icon={Icon.EditUnbordered}
        iconSize={17}
        onClick={() => onEdit(rowData)}
        title="Editer la ligne"
      />
      <IconButton
        accent={Accent.TERTIARY}
        data-cy={`delete-row-${rowData[id]}`}
        Icon={Icon.Delete}
        iconSize={17}
        onClick={() => onDelete(rowData[id])}
        title="Supprimer la ligne"
      />
    </Cell>
  )
}

export function DeleteCell({ dataKey, id, onClick, ...props }) {
  const { rowData } = props

  return (
    <Cell key={rowData[id]} {...props} style={{ padding: '5px 2px' }}>
      <IconButton
        accent={Accent.TERTIARY}
        data-cy={`delete-row-${rowData[id]}`}
        Icon={Icon.Delete}
        iconSize={17}
        onClick={() => onClick(rowData[id], rowData[dataKey])}
        title="Supprimer la ligne"
      />
    </Cell>
  )
}

const TableBody = styled.tbody``

const Fields = styled.table`
  text-align: left;
`

const Key = styled.th`
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  font-weight: normal;
  line-height: 1.5;
  width: 140px;
`

const Value = styled.td`
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
`

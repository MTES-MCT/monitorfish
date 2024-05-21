import { COLORS } from '../../constants/constants'
import { RiskFactorBox } from '../VesselSidebar/risk_factor/RiskFactorBox'
import { getRiskFactorColor } from '../../domain/entities/vessel/riskFactor'
import { useCallback } from 'react'
import styled from 'styled-components'
import { SelectPicker, Table } from 'rsuite'
import { Accent, Icon, IconButton, Tag, THEME } from '@mtes-mct/monitor-ui'
import { theme } from '../../ui/theme'

const { Cell } = Table
const rowKey = 'id'
export const INPUT_TYPE = {
  STRING: 'STRING',
  INT: 'INT',
  DOUBLE: 'DOUBLE'
}

/**
 * @param {*} props
 */
export const ModifiableCell = ({ dataKey, id, inputType, maxLength, onChange, afterChange, isDisabled, ...props }) => {
  const { rowData } = props
  const dataCy = `row-${rowData[id]}-${dataKey}`

  return (
    <ModifiableCellWrapper>
      <Cell title={rowData[dataKey]} key={rowData[id]} className={'table-content-editing'} {...props}>
        <FleetSegmentInput
          isDisabled={isDisabled}
          afterChange={afterChange}
          withinCell
          maxLength={maxLength}
          value={rowData[dataKey]}
          inputType={inputType}
          id={rowData[id]}
          dataCy={dataCy}
          dataKey={dataKey}
          onChange={onChange}
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

export const FleetSegmentInput = ({
  maxLength,
  value,
  inputType,
  id,
  dataKey,
  withinCell,
  onChange,
  dataCy,
  isDisabled,
  afterChange
}) => {
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
      data-cy={dataCy}
      id={id}
      disabled={isDisabled}
      style={{
        fontSize: 13,
        marginTop: withinCell ? -8 : 5,
        marginBottom: withinCell ? 0 : 20,
        marginLeft: withinCell ? -7 : 0,
        marginRight: 0,
        paddingLeft: 5,
        paddingRight: 10,
        fontWeight: 500
      }}
      type="text"
      maxLength={maxLength}
      className="rs-input"
      value={value}
      onChange={event => onChangeCallback(event)}
    />
  )
}

export const ControlPriorityCell = ({ dataKey, onChange, ...props }) => {
  const { rowData } = props
  const dataCy = `row-${rowData.id}-${dataKey}`

  return (
    <Cell key={rowData.id} {...props} className={'table-content-editing'}>
      <SelectPicker
        data-cy={dataCy}
        value={rowData[dataKey]}
        onChange={value => {
          const controlPriority = value && !isNaN(parseInt(value)) ? parseInt(value) : ''
          onChange && onChange(rowData.id, dataKey, controlPriority)
        }}
        data={[
          { label: 1, value: 1 },
          { label: 2, value: 2 },
          { label: 3, value: 3 },
          { label: 4, value: 4 }
        ]}
        style={{ width: 20 }}
        creatable={false}
        cleanable={false}
        searchable={false}
        size={'xs'}
      />
    </Cell>
  )
}

/**
 * @param {*} props
 */
export const SegmentCellWithTitle = ({ rowData, dataKey, ...props }) => (
  <Cell
    title={`Segment ${rowData[dataKey] || 'inconnu'}`}
    style={{ background: rowData.segmentName ? 'unset' : theme.color.goldenPoppy }}
    {...props}
  >
    {rowData[dataKey]}
  </Cell>
)

/**
 * @param {*} props
 */
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
    {expandedRowKeys.some(key => key === rowData[rowKey]) ? '-' : '+'}
  </Cell>
)

/**
 * @param {*} props
 */
export const ImpactRiskFactorCell = ({ rowData, expandedRowKeys, onChange, ...props }) => (
  <Cell {...props} style={{ marginLeft: 13 }}>
    <RiskFactorBox height={8} color={getRiskFactorColor(rowData.impactRiskFactor)}>
      {rowData.impactRiskFactor}
    </RiskFactorBox>
  </Cell>
)

export const TagsCell = ({ dataKey, data, id, ...props }) => {
  const { rowData } = props

  return (
    <Wrapper>
      <Cell
        {...props}
        title={rowData[dataKey]?.join(', ')}
      >
        <TagOnly>
          {rowData[dataKey]?.map(tag => (
            <Tag backgroundColor={THEME.color.gainsboro} key={tag}>
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
  whiteSpace: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const renderRowExpanded = rowData => {
  return (
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
}

export const EditAndDeleteCell = ({ dataKey, id, onEdit, onDelete, ...props }) => {
  const { rowData } = props

  return (
    <Cell key={rowData[id]} {...props} style={{ padding: '5px 5px', display: 'flex' }}>
      <IconButton
        accent={Accent.TERTIARY}
        Icon={Icon.EditUnbordered}
        data-cy={`edit-row-${rowData[id]}`}
        iconSize={17}
        onClick={() => onEdit(rowData)}
        title="Editer la ligne"
      />
      <IconButton
        accent={Accent.TERTIARY}
        Icon={Icon.Delete}
        data-cy={`delete-row-${rowData[id]}`}
        iconSize={17}
        onClick={() => onDelete(rowData[id])}
        title="Supprimer la ligne"
      />
    </Cell>
  )
}

export const DeleteCell = ({ dataKey, id, onClick, ...props }) => {
  const { rowData } = props

  return (
    <Cell key={rowData[id]} {...props} style={{ padding: '5px 2px' }}>
      <IconButton
        accent={Accent.TERTIARY}
        Icon={Icon.Delete}
        data-cy={`delete-row-${rowData[id]}`}
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

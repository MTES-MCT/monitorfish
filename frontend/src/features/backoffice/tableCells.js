import { COLORS } from '../../constants/constants'
import { RiskFactorBox } from '../vessel_sidebar/risk_factor/RiskFactorBox'
import { getRiskFactorColor } from '../../domain/entities/riskFactor'
import { ReactComponent as DeleteIconSVG } from '../icons/Icone_suppression.svg'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { InputPicker, Table, Tag, TagPicker } from 'rsuite'
import { useClickOutsideWhenOpenedAndNotInSelector } from '../../hooks/useClickOutsideWhenOpenedAndNotInSelector'
import { theme } from '../../ui/theme'

const { Cell } = Table
const rowKey = 'id'
export const INPUT_TYPE = {
  STRING: 'STRING',
  INT: 'INT',
  DOUBLE: 'DOUBLE'
}

export const ModifiableCell = ({ dataKey, id, inputType, maxLength, onChange, afterChange, ...props }) => {
  const { rowData } = props
  const dataCy = `row-${rowData[id]}-${dataKey}-${rowData[dataKey]}`

  return (
    <ModifiableCellWrapper>
      <Cell
        title={rowData[dataKey]}
        key={rowData[id]}
        className={'table-content-editing'}
        {...props}
      >
        <FleetSegmentInput
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
  .rs-input:focus{
    background: ${COLORS.charcoal};
    color: ${COLORS.white};
  }
`

export const FleetSegmentInput = ({ maxLength, value, inputType, id, dataKey, withinCell, onChange, dataCy, afterChange }) => {

  const onChangeCallback = useCallback(event => {
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

      onChange && onChange(id, dataKey, value)
      if (dataKey === 'segment') {
        afterChange && afterChange(dataCy.replaceAll(id, value))
      } else {
        afterChange && afterChange(dataCy)
      }
  }, [onChange, dataKey, id, afterChange, dataCy])

  return <input
    data-cy={dataCy}
    id={id}
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
}

export const ControlPriorityCell = ({ rowData, dataKey, onChange, ...props }) => {
  return (
    <Cell
      key={rowData.id}
      {...props}
      className={'table-content-editing'}
    >
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
    style={{ background: rowData.segmentName ? 'unset' : theme.color.goldenPoppy }}
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
 */
export const TagPickerCell = ({ dataKey, data, id, onChange, ...props }) => {
  const { rowData } = props
  const wrapperRef = useRef(null)
  const [isOpened, setIsOpened] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpenedAndNotInSelector(wrapperRef, isOpened, '.rs-picker-menu')

  useEffect(() => {
    setIsOpened(false)
  }, [clickedOutsideComponent])

  return <TagPickerWrapper ref={wrapperRef}>
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
            virtualized
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
  </TagPickerWrapper>
}

const TagPickerWrapper = styled.div`
  .rs-picker-default .rs-picker-toggle.rs-btn-xs {
    padding-left: 5px;
  }

  .rs-picker-has-value .rs-btn .rs-picker-toggle-value, .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    color: ${COLORS.charcoal};
  }

  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn-xs {
    padding-right: 17px;
  }

  .rs-picker-tag-wrapper {
    width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: -10px;
  }

  .rs-picker-tag {
    width: 280px;
    background: none;
  }

  .rs-picker-toggle-clean {
    visibility: hidden !important;
  }

  .rs-picker-toggle-caret {
    visibility: hidden !important;
  }

  .rs-picker-toggle-placeholder {
    visibility: hidden !important;
  }

  *:focus {
    outline: none;
}
`

export function renderTagPickerMenuItem (onChange, item) {
  return (
    <Label onClick={() => onChange(item.label)}>
      {item.label}
    </Label>
  )
}

export function renderTagPickerValue (items) {
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
        background: COLORS.white,
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

export const DeleteCell = ({ dataKey, id, onClick, ...props }) => {
  const { rowData } = props

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

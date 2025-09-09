// TODO Re-enable ESLint for this old file which has been migrated from JSX to TSX.
/* eslint-disable */

import { Accent, Icon, IconButton, Select, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, type ChangeEvent } from 'react'
import { Table } from 'rsuite'
import styled from 'styled-components'

import { getRiskFactorColor } from '@features/RiskFactor/utils'
import { theme } from 'ui/theme'
import { RiskFactorBox } from '@features/RiskFactor/components/RiskFactorBox'

import type { InnerCellProps } from 'rsuite-table/lib/Cell'

const { Cell } = Table
export const INPUT_TYPE = {
  DOUBLE: 'DOUBLE',
  INT: 'INT',
  STRING: 'STRING'
}

type ModifiableCellProps = Readonly<
  Omit<InnerCellProps<any, any>, 'onChange' | 'rowData'> &
    React.RefAttributes<HTMLDivElement> & {
      afterChange?: any
      dataKey: string
      id: string
      inputType: any
      isDisabled?: boolean
      maxLength: number
      onChange: any
      rowData?: any
    }
>
export function ModifiableCell({
  afterChange,
  dataKey,
  id,
  inputType,
  isDisabled = false,
  maxLength,
  onChange,
  rowData,
  ...props
}: ModifiableCellProps) {
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
    background: ${p => p.theme.color.charcoal};
    color: ${p => p.theme.color.white};
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
    (event: ChangeEvent<HTMLInputElement>) => {
      let value: number | string | null = null
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
        paddingRight: 10,
        width: 100
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
    <StyledCell key={rowData.id} {...props} className="table-content-editing">
      <Select
        container={document.body}
        cleanable={false}
        isTransparent
        isLabelHidden
        label="Priorité de contrôle"
        name="controlPriority"
        options={[
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 }
        ]}
        data-cy={dataCy}
        onChange={value => {
          const controlPriority = value ?? ''
          onChange && onChange(rowData.id, dataKey, controlPriority)
        }}
        searchable={false}
        value={rowData[dataKey]}
      />
    </StyledCell>
  )
}

const StyledCell = styled(Cell)`
  > div {
    padding: 4px 0 0 0 !important;
  }
`

type SegmentCellWithTitleProps = Readonly<
  Omit<InnerCellProps<any, any>, 'rowData'> &
    React.RefAttributes<HTMLDivElement> & {
      dataKey: string
      rowData?: any
    }
>
export function SegmentCellWithTitle({ dataKey, rowData, ...props }: SegmentCellWithTitleProps) {
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

type RiskFactorCellProps = Readonly<
  Omit<InnerCellProps<any, any>, 'rowData'> & {
    expandedRowKeys?: (number | string)[]
    onChange?: any
    rowData?: any
  }
>
export function ImpactRiskFactorCell({ expandedRowKeys, onChange, rowData, ...props }: RiskFactorCellProps) {
  return (
    <Cell {...props} style={{ marginLeft: 13 }}>
      <RiskFactorBox color={getRiskFactorColor(rowData.impactRiskFactor)}>{rowData.impactRiskFactor}</RiskFactorBox>
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

const TagOnly = styled.div`
  margin-top: 7px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export function EditAndDeleteCell({ dataKey, id, onDelete, onEdit, ...props }) {
  const { rowData } = props

  return (
    <Cell key={rowData[id]} {...props} style={{ display: 'flex', padding: '5px 5px' }}>
      <IconButton
        accent={Accent.TERTIARY}
        data-cy={`edit-row-${rowData[id]}`}
        Icon={Icon.EditUnbordered}
        iconSize={20}
        onClick={() => onEdit(rowData)}
        title="Editer la ligne"
      />
      <IconButton
        accent={Accent.TERTIARY}
        data-cy={`delete-row-${rowData[id]}`}
        Icon={Icon.Delete}
        iconSize={20}
        style={{ marginLeft: 7 }}
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
        style={{
          margin: 8
        }}
      />
    </Cell>
  )
}

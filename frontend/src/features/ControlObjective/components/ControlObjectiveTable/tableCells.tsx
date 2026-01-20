// TODO Re-enable ESLint for this old file which has been migrated from JSX to TSX.
/* eslint-disable */

import {Accent, Icon, IconButton, TextInput} from '@mtes-mct/monitor-ui'
import {useCallback} from 'react'
import {Table} from 'rsuite'
import styled from 'styled-components'

import {getRiskFactorColor} from '@features/RiskFactor/utils'
import {theme} from '../../../../ui/theme'
import {RiskFactorBox} from '@features/RiskFactor/components/RiskFactorBox'

import type {InnerCellProps} from 'rsuite-table/lib/Cell'

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

  const onChangeCallback = useCallback(
    (nextValue: string | undefined) => {
      let value: number | string | undefined

      switch (inputType) {
        case INPUT_TYPE.INT: {
          value = nextValue && !isNaN(parseInt(nextValue)) ? parseInt(nextValue) : 0
          break
        }
        case INPUT_TYPE.DOUBLE: {
          value = nextValue ? nextValue : 0.0
          break
        }
        case INPUT_TYPE.STRING: {
          value = nextValue
          break
        }
      }

      onChange && onChange(rowData[id], dataKey, value)
    },
    [onChange, dataKey, id, afterChange, dataCy]
  )

  return (
    <ModifiableCellWrapper>
      <Cell key={rowData[id]} className="table-content-editing" title={rowData[dataKey]} {...props}>
        <TextInput
          label={dataCy}
          isLabelHidden
          name={dataCy}
          data-cy={dataCy}
          disabled={isDisabled}
          maxLength={maxLength}
          onChange={nextValue => onChangeCallback(nextValue)}
          isLight
          style={{
            marginBottom: 0,
            marginLeft: -7,
            marginRight: 0,
            marginTop: -8,
            paddingLeft: 5,
            paddingRight: 10,
          }}
          value={rowData[dataKey]}
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

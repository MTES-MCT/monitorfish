import countries from 'i18n-iso-countries'
import React, { useMemo } from 'react'
import { CellProps, Checkbox, Table } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

const { Cell } = Table

type CellUsingVesselPropertyProps = CellProps & {
  vesselProperty: string
}
export function CellUsingVesselProperty({ vesselProperty }: CellUsingVesselPropertyProps) {
  return <Cell>{rowData => rowData.vesselProperties[vesselProperty]}</Cell>
}

type CheckedCellProps = CellProps & {
  onChange: (vesselId: string, isChecked: boolean) => void
}
export function CheckedCell({ dataKey, onChange, rowData }: CheckedCellProps) {
  const defaultValue = useMemo(() => dataKey && rowData[dataKey], [rowData, dataKey])
  const defaultChecked = useMemo(() => Boolean(defaultValue), [defaultValue])

  return (
    <Cell key={defaultValue} className="table-content-editing">
      <StyledCheckbox
        defaultChecked={defaultChecked}
        defaultValue={defaultValue}
        onChange={value => {
          if (onChange) {
            onChange(rowData.vesselId, !value)
          }
        }}
      />
    </Cell>
  )
}

export const StyledCheckbox = styled(Checkbox)`
  margin-top: -33px;
  margin-left: -10px;
  height: 36px;
`

type FlagCellProps = CellProps & {
  baseUrl: string
  vesselProperty: string
}
export function FlagCell({ baseUrl, rowData, vesselProperty }: FlagCellProps) {
  return (
    <Cell style={{ padding: 0 }}>
      <Flag
        rel="preload"
        src={`${baseUrl ? `${baseUrl}/` : ''}flags/${rowData?.vesselProperties[vesselProperty]}.svg`}
        title={countries.getName(rowData?.vesselProperties[vesselProperty], 'fr')}
      />
    </Cell>
  )
}

type TimeAgoCellProps = CellProps & {
  vesselProperty: string
}
export function TimeAgoCell({ dataKey, rowData, vesselProperty }: TimeAgoCellProps) {
  if (vesselProperty) {
    return (
      <Cell>
        {rowData?.vesselProperties[vesselProperty]
          ? timeago.format(rowData?.vesselProperties[vesselProperty], 'fr')
          : ''}
      </Cell>
    )
  }

  return <Cell>{dataKey && rowData[dataKey] ? timeago.format(rowData[dataKey], 'fr') : ''}</Cell>
}

export function CellWithTitle({ dataKey, rowData }: CellProps) {
  return <Cell title={dataKey && rowData[dataKey]}>{dataKey && rowData[dataKey]}</Cell>
}

export const Flag = styled.img<React.AnchorHTMLAttributes<HTMLAnchorElement>>`
  font-size: 1.5em;
  margin-left: 14px;
  margin-top: 8px;
  display: inline-block;
  width: 1.1em;
  height: 1em;
  vertical-align: middle;
`

export const ContentWithEllipsis = styled.span`
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 120px;
  line-break: auto;
  display: inline-block;
`

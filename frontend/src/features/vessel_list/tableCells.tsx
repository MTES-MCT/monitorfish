/* eslint-disable react/jsx-props-no-spreading */
import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import { CellProps, Checkbox, Table } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import type { InnerCellProps } from 'rsuite-table/es/Cell'

const { Cell } = Table

type CellUsingVesselPropertyProps = InnerCellProps & {
  vesselProperty: string
}
export function CellUsingVesselProperty({ vesselProperty, ...props }: CellUsingVesselPropertyProps) {
  return <Cell {...props}>{rowData => rowData.vesselProperties[vesselProperty]}</Cell>
}

type CheckedCellProps = CellProps & {
  onChange: (vesselFeatureId: string, isChecked: boolean) => void
}
export function CheckedCell({ dataKey, onChange, rowData, ...props }: CheckedCellProps) {
  const defaultValue = useMemo(() => dataKey && rowData[dataKey], [rowData, dataKey])
  const defaultChecked = useMemo(() => Boolean(defaultValue), [defaultValue])

  return (
    <Cell {...props} key={defaultValue} className="table-content-editing">
      <StyledCheckbox
        defaultChecked={defaultChecked}
        defaultValue={defaultValue}
        onChange={value => {
          if (onChange) {
            onChange(rowData.vesselFeatureId, !value)
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

type FlagCellProps = InnerCellProps & {
  baseUrl?: string
  vesselProperty: string
}
export function FlagCell({ baseUrl, rowData, vesselProperty, ...props }: FlagCellProps) {
  return (
    <Cell style={{ padding: 0 }} {...props}>
      <Flag
        rel="preload"
        src={`${baseUrl ? `${baseUrl}/` : ''}flags/${rowData?.vesselProperties[vesselProperty]}.svg`}
        title={countries.getName(rowData?.vesselProperties[vesselProperty], 'fr')}
      />
    </Cell>
  )
}

export function TimeAgoCell({ dataKey, rowData, ...props }: InnerCellProps) {
  return <Cell {...props}>{dataKey && rowData[dataKey] ? timeago.format(rowData[dataKey], 'fr') : ''}</Cell>
}

export function CellWithTitle({ dataKey, rowData, ...props }: CellProps) {
  return (
    <Cell title={dataKey && rowData.vesselProperties[dataKey]} {...props}>
      {dataKey && rowData.vesselProperties[dataKey]}
    </Cell>
  )
}

export const Flag = styled.img<{
  rel?: 'preload'
}>`
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

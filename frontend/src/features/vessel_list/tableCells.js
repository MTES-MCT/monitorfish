import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import { Checkbox, Table } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

const { Cell } = Table

export function CellUsingVesselProperty({ vesselProperty, ...props }) {
  return <Cell {...props}>{rowData => rowData.vesselProperties[vesselProperty]}</Cell>
}

export function CheckedCell({ dataKey, onChange, rowData, ...props }) {
  const defaultValue = useMemo(() => rowData[dataKey], [rowData[dataKey]])
  const defaultChecked = useMemo(() => Boolean(defaultValue), [defaultValue])

  return (
    <Cell key={defaultValue} {...props} className="table-content-editing">
      <StyledCheckbox
        defaultChecked={defaultChecked}
        defaultValue={defaultValue}
        onChange={value => {
          onChange && onChange(rowData.vesselId, !value)
        }}
      />
    </Cell>
  )
}

export const StyledCheckbox = styled(Checkbox)`
  margin-top: -33px;
  margin-left: -10px;
`

export function FlagCell({ baseUrl, rowData, vesselProperty, ...props }) {
  return (
    <Cell {...props} style={{ padding: 0 }}>
      <Flag
        rel="preload"
        src={`${baseUrl ? `${baseUrl}/` : ''}flags/${rowData?.vesselProperties[vesselProperty]}.svg`}
        title={countries.getName(rowData?.vesselProperties[vesselProperty], 'fr')}
      />
    </Cell>
  )
}

export function TimeAgoCell({ dataKey, rowData, vesselProperty, ...props }) {
  if (vesselProperty) {
    return (
      <Cell {...props}>
        {rowData?.vesselProperties[vesselProperty]
          ? timeago.format(rowData?.vesselProperties[vesselProperty], 'fr')
          : ''}
      </Cell>
    )
  }

  return <Cell {...props}>{rowData[dataKey] ? timeago.format(rowData[dataKey], 'fr') : ''}</Cell>
}

export function EllipsisCell({ dataKey, rowData, ...props }) {
  return (
    <Cell title={rowData[dataKey]} {...props}>
      <ContentWithEllipsis>{rowData[dataKey]}</ContentWithEllipsis>
    </Cell>
  )
}

export function CellWithTitle({ dataKey, rowData, ...props }) {
  return (
    <Cell title={rowData[dataKey]} {...props}>
      {rowData[dataKey]}
    </Cell>
  )
}

export const Flag = styled.img`
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

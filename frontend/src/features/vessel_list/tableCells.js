import { Checkbox, Table } from 'rsuite'
import countries from 'i18n-iso-countries'
import * as timeago from 'timeago.js'
import { useMemo } from 'react'
import styled from 'styled-components'

const { Cell } = Table

export const CellUsingVesselProperty = ({ vesselProperty, ...props }) => {
  return <Cell {...props} >
    {(rowData) => rowData.vesselProperties[vesselProperty]}
  </Cell>
}

export const CheckedCell = ({ rowData, dataKey, onChange, ...props }) => {
  const defaultValue = useMemo(() => rowData[dataKey], [rowData[dataKey]])
  const defaultChecked = useMemo(() => Boolean(defaultValue), [defaultValue])

  return (
    <Cell key={defaultValue} {...props} className={'table-content-editing'} >
      <StyledCheckbox
        defaultValue={defaultValue}
        defaultChecked={defaultChecked}
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
  height: 36px;
`

export const FlagCell = ({ rowData, vesselProperty, baseUrl, ...props }) => (
  <Cell {...props} style={{ padding: 0 }}>
    <Flag title={countries.getName(rowData?.vesselProperties[vesselProperty], 'fr')} rel="preload" src={`${baseUrl ? `${baseUrl}/` : ''}flags/${rowData?.vesselProperties[vesselProperty]}.svg`}/>
  </Cell>
)

export const TimeAgoCell = ({ rowData, dataKey, vesselProperty, ...props }) => {
  if (vesselProperty) {
    return (
        <Cell {...props}>
          {rowData?.vesselProperties[vesselProperty] ? timeago.format(rowData?.vesselProperties[vesselProperty], 'fr') : ''}
        </Cell>
    )
  }
  return (
      <Cell {...props}>
        {rowData[dataKey] ? timeago.format(rowData[dataKey], 'fr') : ''}
      </Cell>
  )
}

export const EllipsisCell = ({ rowData, dataKey, ...props }) => (
  <Cell title={rowData[dataKey]} {...props}>
    <ContentWithEllipsis>
      {rowData[dataKey]}
    </ContentWithEllipsis>
  </Cell>
)

export const CellWithTitle = ({ rowData, dataKey, ...props }) => (
  <Cell title={rowData[dataKey]} {...props}>
    {rowData[dataKey]}
  </Cell>
)

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

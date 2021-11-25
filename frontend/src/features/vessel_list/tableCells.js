import Checkbox from 'rsuite/lib/Checkbox'
import countries from 'i18n-iso-countries'
import * as timeago from 'timeago.js'
import React from 'react'
import Table from 'rsuite/lib/Table'
import styled from 'styled-components'

const { Cell } = Table

export const TargetCell = ({ rowData, dataKey, onChange, ...props }) => {
  return (
    <Cell key={rowData.id} {...props} className={'table-content-editing'}>
      <input
        style={{ fontSize: 13, marginLeft: -5, marginTop: -8, fontWeight: 500 }}
        type="text"
        maxLength={3}
        className="rs-input"
        value={rowData[dataKey]}
        onChange={event => {
          const value = (event.target.value && !isNaN(parseInt(event.target.value))) ? parseInt(event.target.value) : ''
          onChange && onChange(rowData.id, dataKey, value)
        }}
      />
    </Cell>
  )
}

export const CheckedCell = ({ rowData, dataKey, onClick, onChange, ...props }) => {
  return (
    <Cell {...props} className={'table-content-editing'}>
      <Checkbox
        value={rowData[dataKey]}
        checked={rowData[dataKey]}
        onChange={value => {
          onChange && onChange(rowData.id, dataKey, !value)
        }}
        onClick={() => {
          onClick && onClick(rowData.id)
        }}
      />
    </Cell>
  )
}

export const FlagCell = ({ rowData, dataKey, baseUrl, ...props }) => (
  <Cell {...props} style={{ padding: 0 }}>
    <Flag title={countries.getName(rowData[dataKey], 'fr')} rel="preload" src={`${baseUrl}/flags/${rowData[dataKey]}.svg`}/>
  </Cell>
)

export const TimeAgoCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    {rowData[dataKey] ? timeago.format(rowData[dataKey], 'fr') : ''}
  </Cell>
)

export const EllipsisCell = ({ rowData, dataKey, ...props }) => (
  <Cell title={rowData[dataKey]} {...props}>
    <CellWithEllipsis>
      {rowData[dataKey]}
    </CellWithEllipsis>
  </Cell>
)

export const CellWithTitle = ({ rowData, dataKey, ...props }) => (
  <Cell title={rowData[dataKey]} {...props}>
    {rowData[dataKey]}
  </Cell>
)

const Flag = styled.img`
  font-size: 1.5em;
  margin-left: 14px;
  margin-top: 8px;
  display: inline-block;
  width: 1.1em;
  height: 1em;
  vertical-align: middle;
`

const CellWithEllipsis = styled.span`
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;    
  max-width: 120px; 
  line-break: auto;
  display: inline-block;
`

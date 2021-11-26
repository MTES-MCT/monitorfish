import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes.svg'
import { COLORS } from '../../../constants/constants'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import Table from 'rsuite/lib/Table'
import { ExpandCell, renderRowExpanded } from './tableCells'
import { CellWithTitle, FlagCell, TimeAgoCell } from '../../vessel_list/tableCells'
import { ReactComponent as FlagSVG } from '../../icons/flag.svg'

const { Column, HeaderCell, Cell } = Table
const rowKey = 'id'

const AlertsWindowTable = ({ alerts, alertType, baseUrl }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [sortedAlerts, setSortedAlerts] = useState([])
  const [sortColumn, setSortColumn] = useState('segment')
  const [sortType, setSortType] = useState(SortType.ASC)

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  useEffect(() => {
    if (alerts) {
      const sortedAlerts = alerts
        .slice()
        .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

      setSortedAlerts(sortedAlerts)
    }
  }, [alerts, sortColumn, sortType])

  const handleExpanded = (rowData, dataKey) => {
    let open = false
    const nextExpandedRowKeys = []

    expandedRowKeys.forEach(key => {
      if (key === rowData[rowKey]) {
        open = true
      } else {
        nextExpandedRowKeys.push(key)
      }
    })

    if (!open) {
      nextExpandedRowKeys.push(rowData[rowKey])
    }

    setExpandedRowKeys(nextExpandedRowKeys)
  }

  return <Content>
    <Title><AlertsIcon/> { alertType }</Title>
    <Table
      height={(sortedAlerts?.length || 0) * 36 + expandedRowKeys.length * 65 + (sortedAlerts?.length ? 43 : 83)}
      width={522}
      data={sortedAlerts}
      rowKey={rowKey}
      expandedRowKeys={expandedRowKeys}
      renderRowExpanded={renderRowExpanded}
      rowExpandedHeight={65}
      rowHeight={36}
      affixHorizontalScrollbar
      locale={{
        emptyMessage: 'Aucun résultat',
        loading: 'Chargement...'
      }}
      sortColumn={sortColumn}
      sortType={sortType}
      onSortColumn={handleSortColumn}
    >
      <Column width={50} align="center">
        <HeaderCell/>
        <ExpandCell dataKey="id" expandedRowKeys={expandedRowKeys} onChange={handleExpanded}/>
      </Column>

      <Column sortable width={50}>
        <HeaderCell>
          <FlagIcon/>
        </HeaderCell>
        <FlagCell dataKey="flagState" baseUrl={baseUrl}/>
      </Column>

      <Column sortable width={170} fixed>
        <HeaderCell>Nom du navire</HeaderCell>
        <CellWithTitle dataKey="vesselName"/>
      </Column>

      <Column sortable width={120}>
        <HeaderCell>CFR</HeaderCell>
        <Cell dataKey="internalReferenceNumber"/>
      </Column>

      <Column sortable width={130}>
        <HeaderCell>Alerte il y a...</HeaderCell>
        <TimeAgoCell dataKey="dateTime"/>
      </Column>
    </Table>
  </Content>
}

const FlagIcon = styled(FlagSVG)`
  width: 20px;
  height: 20px;
  vertical-align: top;
`

const Content = styled.div`
  margin: 30px 40px;
  
  .rs-table-row-expanded {
    height: 63px !important;
    background: white !important;
    padding: 0;
}
`

const Title = styled.h2`
  font-size: 16px;
  color: #282F3E;
  border-bottom: 2px solid ${COLORS.titleBottomBorder};
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  padding-bottom: 5px;
  width: fit-content;
`

const AlertsIcon = styled(AlertsSVG)`
  margin-bottom: -5px;
  margin-right: 5px;
  width: 17px;
`

export default AlertsWindowTable

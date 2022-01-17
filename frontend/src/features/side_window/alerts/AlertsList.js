import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import { Flag } from '../../vessel_list/tableCells'
import { useSelector } from 'react-redux'
import List from 'rsuite/lib/List'
import FlexboxGrid from 'rsuite/lib/FlexboxGrid'
import { CustomCheckbox } from '../../commonStyles/Backoffice.style'
import countries from 'i18n-iso-countries'
import * as timeago from 'timeago.js'

const AlertsList = ({ alerts, baseUrl }) => {
  const {
    focusOnAlert
  } = useSelector(state => state.alert)

  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [sortedAlerts, setSortedAlerts] = useState([])
  const [sortColumn] = useState('creationDate')
  const [sortType] = useState(SortType.DESC)

  useEffect(() => {
    if (focusOnAlert) {
      setExpandedRowKeys(expandedRowKeys.concat(focusOnAlert.id))
    }
  }, [focusOnAlert])

  useEffect(() => {
    if (alerts) {
      const sortedAlerts = alerts
        .slice()
        .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

      setSortedAlerts(sortedAlerts)
    }
  }, [alerts, sortColumn, sortType])

  return <Content>
    <List style={{ width: 1131 }}>
      {sortedAlerts.map((item, index) => (
        <List.Item key={item.id} index={index + 1} style={listItemStyle}>
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={2} style={styleCenter}>
              <Checkbox/>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item
              colspan={6}
              style={{
                ...styleCenter,
                display: 'flex'
              }}
            >
              <Flag
                title={countries.getName(item.flagState, 'fr')}
                rel="preload"
                src={`${baseUrl ? `${baseUrl}/` : ''}flags/${item.flagState}.svg`}
                style={{ width: 20, marginRight: 5 }}
              />
              {item.vesselName}
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={6} style={styleCenter}>
              {item.internalReferenceNumber}
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={6} style={styleCenter}>
              {timeago.format(item.creationDateTimestamp, 'fr')}
            </FlexboxGrid.Item>
            <FlexboxGrid.Item
              colspan={4}
              style={{
                ...styleCenter
              }}
            >
              3 milles
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </List.Item>
      ))}
    </List>
  </Content>
}

const listItemStyle = {
  background: '#F7F7FA',
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: 1,
  height: 15,
  marginTop: 5
}

const styleCenter = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 15
}

const Checkbox = styled(CustomCheckbox)`
  margin-left: 5px;
`

const Content = styled.div`
  margin: 30px 40px;
`

export default AlertsList

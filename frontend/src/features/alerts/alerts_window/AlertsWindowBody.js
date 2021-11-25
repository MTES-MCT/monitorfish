import React from 'react'
import styled from 'styled-components'
import AlertsWindowTable from './AlertsWindowTable'
import { getAlertForTable } from './dataFormatting'
import { useSelector } from 'react-redux'

const AlertsWindowBody = ({ selectedSeaFront, baseUrl }) => {
  const {
    alerts
  } = useSelector(state => state.alert)

  return <Content>
    <AlertsWindowTable
      alertType={'CHALUTAGE DANS LES 3 MILLES'}
      alerts={alerts
        .map(alert => getAlertForTable(alert))
        .filter(alert => alert.seaFront === selectedSeaFront)}
      baseUrl={baseUrl}
    />
  </Content>
}

const Content = styled.div`
  margin: 30px;
`

export default AlertsWindowBody

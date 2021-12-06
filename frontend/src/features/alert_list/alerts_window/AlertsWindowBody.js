import React from 'react'
import styled from 'styled-components'
import AlertsWindowTable from './AlertsWindowTable'
import { getAlertForTable } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertTypes } from '../../../domain/entities/alerts'

const AlertsWindowBody = ({ selectedMenuSeaFront, baseUrl }) => {
  const {
    alerts
  } = useSelector(state => state.alert)

  console.log(alerts)

  return <Content>
    <AlertsWindowTable
      alertType={AlertTypes.THREE_MILES_TRAWLING_ALERT.name}
      alerts={alerts
        .map(alert => getAlertForTable(alert))
        .filter(alert =>
          (AlertsMenuSeaFrontsToSeaFrontList[selectedMenuSeaFront?.code]?.seaFronts || []).includes(alert?.seaFront))
      }
      baseUrl={baseUrl}
    />
  </Content>
}

const Content = styled.div`
  margin: 30px;
`

export default AlertsWindowBody

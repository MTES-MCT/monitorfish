import React, { useEffect } from 'react'
import styled from 'styled-components'
import AlertsTable from './AlertsTable'
import { getAlertForTable } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu, AlertTypes } from '../../../domain/entities/alerts'

const Alerts = ({ selectedSubMenu, setSelectedSubMenu }) => {
  const {
    alerts,
    focusOnAlert
  } = useSelector(state => state.alert)

  useEffect(() => {
    if (focusOnAlert) {
      const seaFront = focusOnAlert?.value?.seaFront

      const menuSeaFrontName = Object.keys(AlertsMenuSeaFrontsToSeaFrontList)
        .map(menuSeaFrontKey => AlertsMenuSeaFrontsToSeaFrontList[menuSeaFrontKey])
        .find(item => item.seaFronts.includes(seaFront))

      if (menuSeaFrontName) {
        setSelectedSubMenu(AlertsSubMenu[menuSeaFrontName.menuSeaFront])
      }
    }
  }, [focusOnAlert])
  const baseUrl = window.location.origin

  return <Content>
    <AlertsTable
      alertType={AlertTypes.THREE_MILES_TRAWLING_ALERT.name}
      alerts={alerts
        .map(alert => getAlertForTable(alert))
        .filter(alert =>
          (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront))
      }
      baseUrl={baseUrl}
    />
  </Content>
}

const Content = styled.div`
  margin: 30px;
`

export default Alerts

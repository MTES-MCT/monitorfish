import React, { useEffect } from 'react'
import styled from 'styled-components'
import AlertsList from './AlertsList'
import { getAlertForTable } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import { COLORS } from '../../../constants/constants'

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
    <AlertsList
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
  background: ${COLORS.white};
`

export default Alerts

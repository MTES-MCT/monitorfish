import React, { useEffect } from 'react'
import styled from 'styled-components'
import AlertsList from './AlertsList'
import { getAlertForList } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import { COLORS } from '../../../constants/constants'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @return {JSX.Element}
 * @constructor
 */
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

  return <Content style={contentStyle}>
    <AlertsList
      alerts={alerts
        .map(alert => getAlertForList(alert))
        .filter(alert =>
          (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront))
      }
    />
  </Content>
}

const Content = styled.div``
const contentStyle = {
  margin: 30,
  background: COLORS.white
}

export default Alerts

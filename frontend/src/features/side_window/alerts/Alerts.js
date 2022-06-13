import React, { useEffect } from 'react'
import PendingAlertsList from './PendingAlertsList'
import { getAlertForList, getSilencedAlertForList } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import SilencedAlertsList from './SilencedAlertsList'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
const Alerts = ({ selectedSubMenu, setSelectedSubMenu, baseRef }) => {
  const {
    alerts,
    silencedAlerts,
    focusOnAlert
  } = useSelector(state => state.alert)
  const silencedAlertsOfSeaFront = silencedAlerts
    .map(alert => getSilencedAlertForList(alert))
    .filter(alert => (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront))

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

  return <>
    <Title style={titleStyle}>Alertes</Title>
    <PendingAlertsList
      alerts={alerts
        .map(alert => getAlertForList(alert))
        .filter(alert =>
          (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront))
      }
      seaFront={selectedSubMenu?.name}
      numberOfSilencedAlerts={silencedAlertsOfSeaFront.length}
      baseRef={baseRef}
    />
    <SilencedAlertsList
      silencedAlerts={silencedAlertsOfSeaFront}
    />
  </>
}

const Title = styled.h2``
const titleStyle = {
  margin: '30px 40px 30px 40px',
  fontSize: 22,
  color: COLORS.gunMetal,
  borderBottom: `5px solid ${COLORS.charcoal}`,
  fontWeight: 700,
  textAlign: 'left',
  paddingBottom: 5,
  width: 'fit-content'
}

export default Alerts

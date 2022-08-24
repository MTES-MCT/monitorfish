import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import { getAlertForList, getSilencedAlertForList } from './dataFormatting'
import PendingAlertsList from './PendingAlertsList'
import SilencedAlertsList from './SilencedAlertsList'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
function Alerts({ baseRef, selectedSubMenu, setSelectedSubMenu }) {
  const { alerts, focusOnAlert, silencedAlerts } = useSelector(state => state.alert)
  const silencedAlertsOfSeaFront = silencedAlerts
    .map(alert => getSilencedAlertForList(alert))
    .filter(alert =>
      (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront),
    )

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

  return (
    <>
      <Title style={titleStyle}>Alertes</Title>
      <PendingAlertsList
        alerts={alerts
          .map(alert => getAlertForList(alert))
          .filter(alert =>
            (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront),
          )}
        baseRef={baseRef}
        numberOfSilencedAlerts={silencedAlertsOfSeaFront.length}
        seaFront={selectedSubMenu?.name}
      />
      <SilencedAlertsList silencedAlerts={silencedAlertsOfSeaFront} />
    </>
  )
}

const Title = styled.h2``
const titleStyle = {
  borderBottom: `5px solid ${COLORS.charcoal}`,
  color: COLORS.gunMetal,
  fontSize: 22,
  fontWeight: 700,
  margin: '30px 40px 30px 40px',
  paddingBottom: 5,
  textAlign: 'left',
  width: 'fit-content',
}

export default Alerts

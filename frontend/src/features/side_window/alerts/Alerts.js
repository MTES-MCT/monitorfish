import React, { useEffect } from 'react'
import PendingAlertsList from './PendingAlertsList'
import { getAlertForList } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList, AlertsSubMenu } from '../../../domain/entities/alerts'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

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

  return <>
    <Title style={titleStyle}>Alertes</Title>
    <PendingAlertsList
      alerts={alerts
        .map(alert => getAlertForList(alert))
        .filter(alert =>
          (AlertsMenuSeaFrontsToSeaFrontList[selectedSubMenu?.code]?.seaFronts || []).includes(alert?.seaFront))
      }
      baseRef={baseRef}
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

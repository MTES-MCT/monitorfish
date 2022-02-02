import React from 'react'
import styled from 'styled-components'
import AlertsList from './AlertsList'
import { getAlertForList } from './dataFormatting'
import { useSelector } from 'react-redux'
import { AlertsMenuSeaFrontsToSeaFrontList } from '../../../domain/entities/alerts'
import { COLORS } from '../../../constants/constants'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param selectedSubMenu
 * @param setSelectedSubMenu
 * @return {JSX.Element}
 * @constructor
 */
const Alerts = ({ selectedSubMenu }) => {
  const {
    alerts
  } = useSelector(state => state.alert)

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

import React from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes.svg'
import { COLORS } from '../../../constants/constants'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { closeSideWindow, openSideWindowTab } from '../../../domain/shared_slices/Global'
import { sideWindowMenu } from '../../../domain/entities/sideWindow'

const AlertsMapButton = () => {
  const dispatch = useDispatch()
  const {
    regulatoryZoneMetadataPanelIsOpen
  } = useSelector(state => state.regulatory)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode,
    openedSideWindowTab,
    sideWindowIsOpen
  } = useSelector(state => state.global)

  return <>
    <AlertsButton
      data-cy={'alerts-button'}
      title={'Alertes'}
      isVisible={openedSideWindowTab === sideWindowMenu.ALERTS.code}
      regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
      healthcheckTextWarning={healthcheckTextWarning}
      isHidden={previewFilteredVesselsMode}
      onClick={() => {
        if (!sideWindowIsOpen || (sideWindowIsOpen && openedSideWindowTab !== sideWindowMenu.ALERTS.code)) {
          dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))
          return
        }

        if (sideWindowIsOpen && openedSideWindowTab === sideWindowMenu.ALERTS.code) {
          dispatch(closeSideWindow())
        }
      }}
    >
      <AlertsIcon/>
    </AlertsButton>
  </>
}

const AlertsButton = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  background: ${props => props.isVisible ? COLORS.shadowBlue : COLORS.charcoal};
  padding: 2px 2px 2px 2px;
  top: 65px;
  left: 12px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover, :focus {
      background: ${props => props.isVisible ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 5px;
  width: 20px;
`

export default AlertsMapButton

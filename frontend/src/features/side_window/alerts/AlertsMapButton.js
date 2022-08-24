import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { sideWindowMenu } from '../../../domain/entities/sideWindow'
import { closeSideWindow, openSideWindowTab } from '../../../domain/shared_slices/Global'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes.svg'

function AlertsMapButton() {
  const dispatch = useDispatch()
  const { regulatoryZoneMetadataPanelIsOpen } = useSelector(state => state.regulatory)
  const { healthcheckTextWarning, openedSideWindowTab, previewFilteredVesselsMode, sideWindowIsOpen } = useSelector(
    state => state.global,
  )

  return (
    <AlertsButton
      data-cy="alerts-button"
      healthcheckTextWarning={healthcheckTextWarning}
      isHidden={previewFilteredVesselsMode}
      isVisible={openedSideWindowTab === sideWindowMenu.ALERTS.code}
      onClick={() => {
        if (!sideWindowIsOpen || (sideWindowIsOpen && openedSideWindowTab !== sideWindowMenu.ALERTS.code)) {
          dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))

          return
        }

        if (sideWindowIsOpen && openedSideWindowTab === sideWindowMenu.ALERTS.code) {
          dispatch(closeSideWindow())
        }
      }}
      regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
      title="Alertes"
    >
      <AlertsIcon />
    </AlertsButton>
  )
}

const AlertsButton = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  background: ${props => (props.isVisible ? COLORS.shadowBlue : COLORS.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 120px;
  left: 12px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${props => (props.isVisible ? COLORS.shadowBlue : COLORS.charcoal)};
  }
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 5px;
  width: 20px;
`

export default AlertsMapButton

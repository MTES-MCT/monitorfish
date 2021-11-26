import React from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { COLORS } from '../../constants/constants'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import AlertsWindow from './alerts_window/AlertsWindow'
import { closeAlertList, openAlertList } from '../../domain/shared_slices/Alert'

const AlertListMapButton = () => {
  const dispatch = useDispatch()
  const {
    regulatoryZoneMetadataPanelIsOpen
  } = useSelector(state => state.regulatory)
  const {
    alertListIsOpen
  } = useSelector(state => state.alert)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  return <>
    <Wrapper
      data-cy={'alerts-button'}
      title={'Alertes'}
      isVisible={alertListIsOpen}
      regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
      healthcheckTextWarning={healthcheckTextWarning}
      isHidden={previewFilteredVesselsMode}
      onClick={() => alertListIsOpen ? dispatch(closeAlertList()) : dispatch(openAlertList())}>
      <AlertsIcon/>
    </Wrapper>
    <AlertsWindow
      isOpen={alertListIsOpen}
      closeAlertList={() => dispatch(closeAlertList())}
      baseUrl={window.location.origin}
    />
  </>
}

const Wrapper = styled(MapButtonStyle)`
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
  margin-top: 3px;
`

export default AlertListMapButton

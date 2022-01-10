import React from 'react'
import styled from 'styled-components'
import { batch, useDispatch, useSelector } from 'react-redux'

import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes.svg'
import { COLORS } from '../../../constants/constants'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { resetFocusOnAlert } from '../../../domain/shared_slices/Alert'
import { openSideWindow, closeSideWindow } from '../../../domain/shared_slices/Global'
import NewWindow from 'react-new-window'
import SideWindow from '../SideWindow'

const AlertsMapButton = () => {
  const dispatch = useDispatch()
  const {
    regulatoryZoneMetadataPanelIsOpen
  } = useSelector(state => state.regulatory)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode,
    sideWindowIsOpen
  } = useSelector(state => state.global)

  return <>
    <AlertsButton
      data-cy={'alerts-button'}
      title={'Alertes'}
      isVisible={sideWindowIsOpen}
      regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
      healthcheckTextWarning={healthcheckTextWarning}
      isHidden={previewFilteredVesselsMode}
      onClick={() => sideWindowIsOpen ? dispatch(closeSideWindow()) : dispatch(openSideWindow())}>
      <AlertsIcon/>
    </AlertsButton>Vessel
    {
      sideWindowIsOpen
        ? <NewWindow
          copyStyles
          name={'MonitorFish'}
          title={'MonitorFish'}
          features={{ scrollbars: true, width: '1500px', height: '900px' }}
          onUnload={() => {
            batch(() => {
              dispatch(closeSideWindow())
              dispatch(resetFocusOnAlert())
            })
          }}
        >
          <SideWindow/>
        </NewWindow>
        : null
    }
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
  margin-top: 3px;
`

export default AlertsMapButton

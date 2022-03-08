import React from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { ReactComponent as BeaconMalfunctionsSVG } from '../../icons/Icone_VMS.svg'
import { COLORS } from '../../../constants/constants'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { closeSideWindow, openSideWindowTab } from '../../../domain/shared_slices/Global'
import { sideWindowMenu } from '../../../domain/entities/sideWindow'

const BeaconMalfunctionsMapButton = () => {
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

  return <BeaconMalfunctionsButton
    data-cy={'beacon-malfunction-button'}
    title={'Avaries VMS'}
    isVisible={openedSideWindowTab === sideWindowMenu.BEACON_MALFUNCTIONS.code}
    regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
    healthcheckTextWarning={healthcheckTextWarning}
    isHidden={previewFilteredVesselsMode}
    onClick={() => {
      if (!sideWindowIsOpen || (sideWindowIsOpen && openedSideWindowTab !== sideWindowMenu.BEACON_MALFUNCTIONS.code)) {
        dispatch(openSideWindowTab(sideWindowMenu.BEACON_MALFUNCTIONS.code))
        return
      }

      if (sideWindowIsOpen && openedSideWindowTab === sideWindowMenu.BEACON_MALFUNCTIONS.code) {
        dispatch(closeSideWindow())
      }
    }}
  >
    <BeaconMalfunctionsIcon/>
  </BeaconMalfunctionsButton>
}

const BeaconMalfunctionsButton = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  background: ${props => props.isVisible ? COLORS.shadowBlue : COLORS.charcoal};
  padding: 2px 2px 2px 2px;
  top: 107px;
  left: 12px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover, :focus {
      background: ${props => props.isVisible ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const BeaconMalfunctionsIcon = styled(BeaconMalfunctionsSVG)`
  margin-top: 5px;
  width: 25px;
  margin-right: 0px;
`

export default BeaconMalfunctionsMapButton

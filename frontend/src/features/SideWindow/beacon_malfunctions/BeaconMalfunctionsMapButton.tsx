import styled from 'styled-components'

import { closeSideWindow, openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { ReactComponent as BeaconMalfunctionsSVG } from '../../icons/Icone_VMS.svg'
import { SideWindowMenuKey } from '../constants'

export function BeaconMalfunctionsMapButton() {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, openedSideWindowTab, previewFilteredVesselsMode } = useMainAppSelector(
    state => state.global
  )

  return (
    <BeaconMalfunctionsButton
      data-cy="beacon-malfunction-button"
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={!!previewFilteredVesselsMode}
      isVisible={openedSideWindowTab === SideWindowMenuKey.BEACON_MALFUNCTIONS}
      onClick={() => {
        if (openedSideWindowTab !== SideWindowMenuKey.BEACON_MALFUNCTIONS) {
          dispatch(openSideWindowTab(SideWindowMenuKey.BEACON_MALFUNCTIONS))

          return
        }

        if (openedSideWindowTab === SideWindowMenuKey.BEACON_MALFUNCTIONS) {
          dispatch(closeSideWindow())
        }
      }}
      title="Avaries VMS"
    >
      <BeaconMalfunctionsIcon />
    </BeaconMalfunctionsButton>
  )
}

const BeaconMalfunctionsButton = styled(MapButtonStyle)<{
  isVisible: boolean
}>`
  position: absolute;
  display: inline-block;
  background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 162px;
  left: 12px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  }
`

const BeaconMalfunctionsIcon = styled(BeaconMalfunctionsSVG)`
  margin-top: 5px;
  width: 25px;
  margin-right: 0px;
`

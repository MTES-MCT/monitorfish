import styled from 'styled-components'

import { SideWindowMenuKey } from '../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../domain/shared_slices/SideWindow'
import { sideWindowDispatchers } from '../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { ReactComponent as BeaconMalfunctionsSVG } from '../icons/Icone_VMS.svg'

export function BeaconMalfunctionsMapButton() {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, previewFilteredVesselsMode } = useMainAppSelector(state => state.global)
  const { sideWindow } = useMainAppSelector(state => state)

  return (
    <BeaconMalfunctionsButton
      data-cy="beacon-malfunction-button"
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={!!previewFilteredVesselsMode}
      isVisible={sideWindow.selectedMenuWithSubMenu.menu === SideWindowMenuKey.BEACON_MALFUNCTION_LIST}
      onClick={() => {
        if (sideWindow.selectedMenuWithSubMenu.menu !== SideWindowMenuKey.BEACON_MALFUNCTION_LIST) {
          dispatch(sideWindowDispatchers.openMenuWithSubMenu(SideWindowMenuKey.BEACON_MALFUNCTION_LIST))

          return
        }

        if (sideWindow.selectedMenuWithSubMenu.menu === SideWindowMenuKey.BEACON_MALFUNCTION_LIST) {
          dispatch(sideWindowActions.close())
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
  top: 204px;
  left: 10px;
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

import styled from 'styled-components'

import { getEnvironmentVariable } from '../../api/api'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { ReactComponent as BeaconMalfunctionsSVG } from '../icons/Icone_VMS.svg'
import { SideWindowMenuKey } from './constants'

const IS_DEV_ENV = getEnvironmentVariable('REACT_APP_IS_DEV_ENV')

export type SideWindowMenuProps = {
  selectedMenu?: string
}
export function SideWindowMenu({ selectedMenu }: SideWindowMenuProps) {
  const dispatch = useAppDispatch()

  return (
    <Menu role="menu">
      <MenuButton />
      <MenuButton
        data-cy="side-window-menu-alerts"
        onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.ALERTS))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.ALERTS}
        title={SideWindowMenuKey.ALERTS}
      >
        <AlertsIcon />
      </MenuButton>
      {IS_DEV_ENV && (
        <MenuButton
          aria-label={SideWindowMenuKey.MISSION_LIST}
          onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST))}
          role="menuitem"
          selected={selectedMenu === SideWindowMenuKey.MISSION_LIST}
          title={SideWindowMenuKey.MISSION_LIST}
        >
          <BeaconMalfunctionsIcon />
        </MenuButton>
      )}
      <MenuButton
        data-cy="side-window-menu-beacon-malfunctions"
        onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.BEACON_MALFUNCTIONS))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.BEACON_MALFUNCTIONS}
        title={SideWindowMenuKey.BEACON_MALFUNCTIONS}
      >
        <BeaconMalfunctionsIcon />
      </MenuButton>
    </Menu>
  )
}

const Menu = styled.div`
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  flex-shrink: 0;
  font-size: 11px;
  height: 100vh;
  padding: 0;
  width: 66px;
`

const MenuButton = styled.div<{
  selected?: boolean
}>`
  background: ${p => (p.selected ? p.theme.color.blueGray[100] : 'none')};
  border-bottom: 0.5px solid ${p => p.theme.color.slateGray};
  cursor: pointer;
  height: 50px;
  padding: 7px 5px;
  text-align: center;
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 12px;
`

const BeaconMalfunctionsIcon = styled(BeaconMalfunctionsSVG)`
  margin-top: 12px;
`

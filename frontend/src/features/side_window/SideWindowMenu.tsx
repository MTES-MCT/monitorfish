import styled from 'styled-components'

import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { ReactComponent as BeaconMalfunctionsSVG } from '../icons/Icone_VMS.svg'
import { SIDE_WINDOW_MENU } from './constants'

export type SideWindowMenuProps = {
  selectedMenu?: string
}
export function SideWindowMenu({ selectedMenu }: SideWindowMenuProps) {
  const dispatch = useAppDispatch()

  return (
    <Menu role="menu">
      <MenuButton />
      <MenuButton
        onClick={() => dispatch(openSideWindowTab(SIDE_WINDOW_MENU.ALERTS.code))}
        role="menuitem"
        selected={selectedMenu === SIDE_WINDOW_MENU.ALERTS.code}
        title={SIDE_WINDOW_MENU.ALERTS.name}
      >
        <AlertsIcon />
      </MenuButton>
      <MenuButton
        data-cy="side-window-menu-beacon-malfunctions"
        onClick={() => dispatch(openSideWindowTab(SIDE_WINDOW_MENU.BEACON_MALFUNCTIONS.code))}
        role="menuitem"
        selected={selectedMenu === SIDE_WINDOW_MENU.BEACON_MALFUNCTIONS.code}
        title={SIDE_WINDOW_MENU.BEACON_MALFUNCTIONS.name}
      >
        <BeaconMalfunctionsIcon />
      </MenuButton>
    </Menu>
  )
}

const Menu = styled.div`
  width: 66px;
  height: 100vh;
  background: ${p => p.theme.color.charcoal};
  flex-shrink: 0;
  font-size: 11px;
  color: ${p => p.theme.color.gainsboro};
  padding: 0;
`

const MenuButton = styled.button<{
  selected?: boolean
}>`
  text-align: center;
  background: ${p => (p.selected ? p.theme.color.shadowBlue : 'none')};
  padding: 7px 5px;
  height: 50px;
  cursor: pointer;
  border-bottom: 0.5px solid ${p => p.theme.color.slateGray};
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 12px;
`

const BeaconMalfunctionsIcon = styled(BeaconMalfunctionsSVG)`
  margin-top: 12px;
`

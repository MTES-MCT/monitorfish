import styled from 'styled-components'

import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { ReactComponent as BeaconMalfunctionsSVG } from '../icons/Icone_VMS.svg'

export type SideWindowMenuProps = {
  selectedMenu?: string
}
export function SideWindowMenu({ selectedMenu }: SideWindowMenuProps) {
  const dispatch = useAppDispatch()

  return (
    <Menu role="menu">
      <MenuButton />
      <MenuButton
        onClick={() => dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))}
        role="menuitem"
        selected={selectedMenu === sideWindowMenu.ALERTS.code}
        title={sideWindowMenu.ALERTS.name}
      >
        <AlertsIcon />
      </MenuButton>
      <MenuButton
        data-cy="side-window-menu-beacon-malfunctions"
        onClick={() => dispatch(openSideWindowTab(sideWindowMenu.BEACON_MALFUNCTIONS.code))}
        selected={selectedMenu === sideWindowMenu.BEACON_MALFUNCTIONS.code}
        title={sideWindowMenu.BEACON_MALFUNCTIONS.name}
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

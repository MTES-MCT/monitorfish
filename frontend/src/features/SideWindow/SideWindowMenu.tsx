import { Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { SideWindowMenuKey } from './constants'
import { getEnvironmentVariable } from '../../api/api'
import { openSideWindowTab } from '../../domain/shared_slices/Global'
import { useAppDispatch } from '../../hooks/useAppDispatch'

const IS_DEV_ENV = getEnvironmentVariable('REACT_APP_IS_DEV_ENV')

export type SideWindowMenuProps = {
  selectedMenu?: string
}
export function SideWindowMenu({ selectedMenu }: SideWindowMenuProps) {
  const dispatch = useAppDispatch()

  return (
    <Menu role="menu">
      <MenuButton
        data-cy="side-window-menu-alerts"
        Icon={Icon.Alert}
        iconSize={26}
        onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.ALERTS))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.ALERTS}
        title={SideWindowMenuKey.ALERTS}
      />
      {IS_DEV_ENV && (
        <MenuButton
          aria-label={SideWindowMenuKey.MISSION_LIST}
          data-cy="side-window-menu-mission-list"
          Icon={Icon.Target}
          iconSize={26}
          onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST))}
          role="menuitem"
          selected={selectedMenu === SideWindowMenuKey.MISSION_LIST}
          title={SideWindowMenuKey.MISSION_LIST}
        />
      )}
      <MenuButton
        data-cy="side-window-menu-beacon-malfunctions"
        Icon={Icon.Vms}
        iconSize={26}
        onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.BEACON_MALFUNCTIONS))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.BEACON_MALFUNCTIONS}
        title={SideWindowMenuKey.BEACON_MALFUNCTIONS}
      />
    </Menu>
  )
}

const Menu = styled.div`
  background-color: ${p => p.theme.color.charcoal};
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 70px 0 0;
`

const MenuButton = styled(IconButton)<{
  selected?: boolean
}>`
  animation: none;
  background: ${p => (p.selected ? p.theme.color.blueGray[100] : 'none')};
  border: 0;
  border-bottom: solid 1px ${p => p.theme.color.slateGray};
  color: ${p => (p.selected ? p.theme.color.white : p.theme.color.gainsboro)};
  padding: 22px;

  :hover,
  :focus {
    background: ${p => (p.selected ? p.theme.color.blueGray[100] : 'rgba(255, 255, 255, 0.125)')};
    border: 0;
    border-bottom: solid 1px ${p => p.theme.color.slateGray};
    color: ${p => p.theme.color.white};
  }

  :first-child {
    border-top: solid 1px ${p => p.theme.color.slateGray};

    :hover {
      border-top: solid 1px ${p => p.theme.color.slateGray};
    }
  }
`

import { IconButton } from '@mtes-mct/monitor-ui'
import styled, { css } from 'styled-components'

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
      <MenuButton
        data-cy="side-window-menu-alerts"
        Icon={AlertsIcon}
        onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.ALERTS))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.ALERTS}
        title={SideWindowMenuKey.ALERTS}
      />
      {IS_DEV_ENV && (
        <MenuButton
          aria-label={SideWindowMenuKey.MISSION_LIST}
          data-cy="side-window-menu-mission-list"
          Icon={BeaconMalfunctionsIcon}
          onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST))}
          role="menuitem"
          selected={selectedMenu === SideWindowMenuKey.MISSION_LIST}
          title={SideWindowMenuKey.MISSION_LIST}
        />
      )}
      <MenuButton
        data-cy="side-window-menu-beacon-malfunctions"
        Icon={BeaconMalfunctionsIcon}
        onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.BEACON_MALFUNCTIONS))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.BEACON_MALFUNCTIONS}
        title={SideWindowMenuKey.BEACON_MALFUNCTIONS}
      />
    </Menu>
  )
}

const Menu = styled.div`
  background-color: ${p => p.theme.color.charcoal} !important;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  font-size: 11px;
  height: 100vh;
  padding: 0;
  width: 66px;
`

const MenuButton = styled(IconButton)<{
  selected?: boolean
}>`
  background: ${p => (p.selected ? p.theme.color.blueGray[100] : 'none')};
  padding-bottom: 18px;
  padding-top: 7px;

  ${p =>
    p.selected &&
    css`
      :hover {
        background: ${p.theme.color.blueGray[100]} !important;
      }
    `}
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 12px;
`

const BeaconMalfunctionsIcon = styled(BeaconMalfunctionsSVG)`
  margin-top: 12px;
`

import { Icon, IconButton } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import styled from 'styled-components'

import { SideWindowMenuKey, SideWindowMenuLabel } from '../../../domain/entities/sideWindow/constants'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { openSideWindowPath } from '../useCases/openSideWindowPath'

export type MenuProps = Readonly<{
  selectedMenu: string | undefined
}>
export function Menu({ selectedMenu }: MenuProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  return (
    <Wrapper role="menu">
      <MenuButton
        aria-label={SideWindowMenuKey.MISSION_LIST}
        data-cy="side-window-menu-mission-list"
        Icon={Icon.MissionAction}
        iconSize={26}
        onClick={() => dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.MISSION_LIST}
        title={SideWindowMenuLabel.MISSION_LIST}
      />
      <MenuButton
        data-cy="side-window-menu-alerts"
        Icon={Icon.Alert}
        iconSize={26}
        onClick={() => dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST}
        title={SideWindowMenuLabel.ALERT_LIST_AND_REPORTING_LIST}
      />
      {(isSuperUser || import.meta.env.FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED === 'true') && (
        <MenuButton
          aria-label={SideWindowMenuKey.PRIOR_NOTIFICATION_LIST}
          Icon={Icon.Fishery}
          iconSize={26}
          onClick={() => dispatch(openSideWindowPath({ menu: SideWindowMenuKey.PRIOR_NOTIFICATION_LIST }))}
          role="menuitem"
          selected={selectedMenu === SideWindowMenuKey.PRIOR_NOTIFICATION_LIST}
          title={SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST}
        />
      )}
      <MenuButton
        data-cy="side-window-menu-beacon-malfunctions"
        Icon={Icon.Vms}
        iconSize={26}
        onClick={() => dispatch(openSideWindowPath({ menu: SideWindowMenuKey.BEACON_MALFUNCTION_BOARD }))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD}
        title={SideWindowMenuLabel.BEACON_MALFUNCTION_BOARD}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.charcoal};
  box-sizing: border-box;
  display: flex;
  height: 100%;
  flex-direction: column;
  max-width: 70px;
  padding: 70px 0 0;
  user-select: none;

  * {
    box-sizing: border-box;
    user-select: none;
  }
`

const MenuButton = styled(IconButton)<{
  selected?: boolean
}>`
  animation: none;
  background: ${p => (p.selected ? p.theme.color.blueGray : 'none')};
  border: 0;
  border-bottom: solid 1px ${p => p.theme.color.slateGray};
  color: ${p => (p.selected ? p.theme.color.white : p.theme.color.gainsboro)};
  padding: 22px;

  &:hover,
  &:focus {
    background: ${p => (p.selected ? p.theme.color.blueGray : 'rgba(255, 255, 255, 0.125)')};
    border: 0;
    border-bottom: solid 1px ${p => p.theme.color.slateGray};
    color: ${p => p.theme.color.white};
  }

  &:first-child {
    border-top: solid 1px ${p => p.theme.color.slateGray};

    &:hover {
      border-top: solid 1px ${p => p.theme.color.slateGray};
    }
  }
`

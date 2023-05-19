import { Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { SideWindowMenuKey, SideWindowMenuLabel } from '../../../domain/entities/sideWindow/constants'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'

export type MenuProps = {
  selectedMenu: string | undefined
}
export function Menu({ selectedMenu }: MenuProps) {
  const dispatch = useMainAppDispatch()

  return (
    <Wrapper role="menu">
      <MenuButton
        data-cy="side-window-menu-alerts"
        Icon={Icon.Alert}
        iconSize={26}
        onClick={() =>
          dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
        }
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST}
        title={SideWindowMenuLabel.ALERT_LIST_AND_REPORTING_LIST}
      />
      <MenuButton
        aria-label={SideWindowMenuKey.MISSION_LIST}
        data-cy="side-window-menu-mission-list"
        Icon={Icon.MissionAction}
        iconSize={26}
        onClick={() => dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.MISSION_LIST }))}
        role="menuitem"
        selected={selectedMenu === SideWindowMenuKey.MISSION_LIST}
        title={SideWindowMenuLabel.MISSION_LIST}
      />
      <MenuButton
        data-cy="side-window-menu-beacon-malfunctions"
        Icon={Icon.Vms}
        iconSize={26}
        onClick={() => dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.BEACON_MALFUNCTION_BOARD }))}
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

  * {
    box-sizing: border-box;
  }
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

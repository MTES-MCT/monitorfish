import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { Icon } from '@mtes-mct/monitor-ui'
import { ROUTER_PATHS } from 'paths'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { BACK_OFFICE_MENU_ITEMS, BACK_OFFICE_MENU_LABEL, BackOfficeMenuKey, BackOfficeMenuPath } from './constants'
import { useGetUserAccount } from '../../../../auth/hooks/useGetUserAccount'

import type { BackOfficeMenuItem } from './constants'

function getIsSelected(pathname: string, key: BackOfficeMenuKey): boolean {
  const path = `${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[key]}`
  // The backoffice index route displays the regulatory zones
  const isIndexRoute = pathname.replace(/\/$/, '') === ROUTER_PATHS.backoffice

  return (
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    (isIndexRoute && key === BackOfficeMenuKey.REGULATORY_ZONE_TABLE)
  )
}

export function BackOfficeMenu() {
  const { pathname } = useLocation()
  const { userAccount } = useGetUserAccount()
  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorageManager.get<boolean>(LocalStorageKey.BackofficeMenuCollapsed, false)
  )

  const visibleItems = BACK_OFFICE_MENU_ITEMS.filter(
    (item: BackOfficeMenuItem) => !item.isAdministratorOnly || !!userAccount?.isAdministrator
  )

  const toggleCollapse = () => {
    localStorageManager.set(LocalStorageKey.BackofficeMenuCollapsed, !isCollapsed)
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Wrapper $isCollapsed={isCollapsed} aria-label="Menu du backoffice">
      <Items>
        <AppTitle $isCollapsed={isCollapsed} title="Backoffice MonitorFish" to={ROUTER_PATHS.backoffice}>
          {isCollapsed ? (
            <AppName>MF</AppName>
          ) : (
            <>
              <AppName>MonitorFish</AppName>
              <AppSection>Backoffice</AppSection>
            </>
          )}
        </AppTitle>
        {visibleItems.map(item => {
          const label = BACK_OFFICE_MENU_LABEL[item.key]
          const isSelected = getIsSelected(pathname, item.key)

          return (
            <MenuLink
              key={item.key}
              $isCollapsed={isCollapsed}
              $isSelected={isSelected}
              aria-current={isSelected ? 'page' : undefined}
              title={isCollapsed ? label : undefined}
              to={`${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[item.key]}`}
            >
              <item.Icon size={26} />
              {!isCollapsed && <Label>{label}</Label>}
            </MenuLink>
          )
        })}
      </Items>

      <Footer>
        <MenuLink
          $isCollapsed={isCollapsed}
          $isSelected={false}
          title={isCollapsed ? 'Retour à la carte' : undefined}
          to={ROUTER_PATHS.home}
        >
          <Icon.ViewOnMap size={26} />
          {!isCollapsed && <Label>Retour à la carte</Label>}
        </MenuLink>
        {!!userAccount?.email && (
          <UserEmail $isCollapsed={isCollapsed} title={userAccount.email}>
            <Icon.Account size={26} />
            {!isCollapsed && <Label>{userAccount.email}</Label>}
          </UserEmail>
        )}
        <CollapseButton
          $isCollapsed={isCollapsed}
          aria-label={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
          onClick={toggleCollapse}
          title={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
          type="button"
        >
          <Icon.DoubleChevron size={20} />
        </CollapseButton>
      </Footer>
    </Wrapper>
  )
}

const Wrapper = styled.nav<{
  $isCollapsed: boolean
}>`
  background-color: ${p => p.theme.color.charcoal};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  justify-content: space-between;
  user-select: none;
  width: ${p => (p.$isCollapsed ? '64px' : '240px')};

  * {
    box-sizing: border-box;
  }
`

const Items = styled.div`
  display: flex;
  flex-direction: column;
`

const Footer = styled.div`
  border-top: solid 1px ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
`

const itemStyle = css<{
  $isCollapsed: boolean
}>`
  align-items: center;
  border-bottom: solid 1px ${p => p.theme.color.slateGray};
  display: flex;
  gap: 12px;
  height: 64px;
  justify-content: ${p => (p.$isCollapsed ? 'center' : 'flex-start')};
  padding: 0 19px;
`

const MenuLink = styled(Link)<{
  $isCollapsed: boolean
  $isSelected: boolean
}>`
  ${itemStyle}
  background: ${p => (p.$isSelected ? p.theme.color.blueGray : 'none')};

  &&,
  &&:visited {
    color: ${p => (p.$isSelected ? p.theme.color.white : p.theme.color.gainsboro)};
    text-decoration: none;
  }

  &:hover,
  &:focus {
    background: ${p => (p.$isSelected ? p.theme.color.blueGray : 'rgba(255, 255, 255, 0.125)')};

    && {
      color: ${p => p.theme.color.white};
    }
  }
`

const UserEmail = styled.div<{
  $isCollapsed: boolean
}>`
  ${itemStyle}
  color: ${p => p.theme.color.lightGray};
  font-size: 13px;
`

const AppTitle = styled(Link)<{
  $isCollapsed: boolean
}>`
  align-items: ${p => (p.$isCollapsed ? 'center' : 'flex-start')};
  border-bottom: solid 1px ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  height: 64px;
  justify-content: center;
  padding: 0 19px;

  &&,
  &&:visited,
  &&:hover,
  &&:focus {
    color: ${p => p.theme.color.white};
    text-decoration: none;
  }
`

const AppName = styled.span`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
`

const AppSection = styled.span`
  color: ${p => p.theme.color.lightGray};
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
`

const Label = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CollapseButton = styled.button<{
  $isCollapsed: boolean
}>`
  ${itemStyle}
  background: none;
  border: 0;
  color: ${p => p.theme.color.gainsboro};
  cursor: pointer;
  justify-content: ${p => (p.$isCollapsed ? 'center' : 'flex-end')};
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.125);
    color: ${p => p.theme.color.white};
  }

  > .Element-IconBox {
    transform: rotate(${p => (p.$isCollapsed ? '-90deg' : '90deg')});
  }
`

import { Icon } from '@mtes-mct/monitor-ui'
import { ROUTER_PATHS } from 'paths'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { BACK_OFFICE_MENU_LABEL, BackOfficeMenuKey, BackOfficeMenuPath } from './constants'

export function BackOfficeMenu() {
  return (
    <Wrapper>
      <StyledNavLink to={`${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[BackOfficeMenuKey.REGULATORY_ZONE_TABLE]}`}>
        <Icon.MapLayers />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.REGULATORY_ZONE_TABLE]}
      </StyledNavLink>
      <StyledNavLink
        to={`${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]}`}
      >
        <Icon.ControlUnit />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.CONTROL_OBJECTIVE_TABLES]}
      </StyledNavLink>
      <StyledNavLink to={`${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[BackOfficeMenuKey.FLEET_SEGMENT_TABLE]}`}>
        <Icon.FleetSegment />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.FLEET_SEGMENT_TABLE]}
      </StyledNavLink>
      <StyledNavLink
        to={`${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]}`}
      >
        <Icon.Fishery />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.PRIOR_NOTIFICATION_SUBSCRIBER_TABLE]}
      </StyledNavLink>
      <StyledNavLink
        to={`${ROUTER_PATHS.backoffice}/${BackOfficeMenuPath[BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE]}`}
      >
        <Icon.Account />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.PRODUCER_ORGANIZATION_TABLE]}
      </StyledNavLink>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${p => p.theme.color.charcoal};
  border-right: solid 1px black;
  color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  letter-spacing: 0.5px;
  line-height: 1;
  width: 180px;
  padding: 16px 24px;
  flex-shrink: 0;
`

const StyledNavLink = styled(NavLink)`
  align-items: center;
  color: ${p => p.theme.color.gainsboro};
  display: flex;
  height: 45px;
  text-align: left;

  && {
    color: ${p => p.theme.color.gainsboro};
  }
  &:after {
    color: ${p => p.theme.color.gainsboro};
  }
  &:before {
    color: ${p => p.theme.color.gainsboro};
  }

  > .Element-IconBox {
    margin-right: 8px;
  }
`

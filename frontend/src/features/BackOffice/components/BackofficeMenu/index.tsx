import { Icon } from '@mtes-mct/monitor-ui'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { BACK_OFFICE_MENU_LABEL, BACK_OFFICE_MENU_PATH, BackOfficeMenuKey } from './constants'

export function BackOfficeMenu() {
  return (
    <Wrapper>
      <StyledNavLink to={`/backoffice${BACK_OFFICE_MENU_PATH[BackOfficeMenuKey.REGULATORY_ZONE_LIST]}`}>
        <Icon.MapLayers />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.REGULATORY_ZONE_LIST]}
      </StyledNavLink>
      <StyledNavLink to={`/backoffice${BACK_OFFICE_MENU_PATH[BackOfficeMenuKey.CONTROL_OBJECTIVE_LIST]}`}>
        <Icon.ControlUnit />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.CONTROL_OBJECTIVE_LIST]}
      </StyledNavLink>
      <StyledNavLink to={`/backoffice${BACK_OFFICE_MENU_PATH[BackOfficeMenuKey.FLEET_SEGMENT_LIST]}`}>
        <Icon.FleetSegment />
        {BACK_OFFICE_MENU_LABEL[BackOfficeMenuKey.FLEET_SEGMENT_LIST]}
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
  min-width: 200px;
  padding: 16px 24px;
  width: 200px;
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

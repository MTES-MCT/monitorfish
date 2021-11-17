import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Link } from 'react-router-dom'
import { ReactComponent as LayersSVG } from '../../icons/Couches.svg'
import { ReactComponent as FleetSVG } from '../../icons/Label_segment_de_flotte_white.svg'

const Menu = () => {
  return (
    <Wrapper>
      <MenuLink
        to={'/backoffice/regulation'}
        title={'Zones réglementaires'}
      >
        <Layers/>
        <LinkText>
          Zones <br/>réglementaires
        </LinkText>
      </MenuLink>
      <MenuLink
        to={'/backoffice/fleet_segments'}
        title={'Segments de flotte'}
      >
        <Fleet/>
        <LinkText>
          Segments <br/>de flotte
        </LinkText>
      </MenuLink>
  </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 128px;
  height: 100vh;
  background: ${COLORS.charcoal};
  flex-shrink: 0;
  font-size: 11px;
  color: ${COLORS.gainsboro};
  padding: 15px 8px;
`

const LinkText = styled.span`
  line-height: 9px;
  margin-left: 5px;
  margin-top: 5px;
  letter-spacing: 0.5px;
`

const MenuLink = styled(Link)`
  color: ${COLORS.gainsboro};
  && {
    color: ${COLORS.gainsboro};
  }
  &:after {
    color: ${COLORS.gainsboro};
  }
  &:before {
    color: ${COLORS.gainsboro};
  }
  display: flex;
  text-align: left;
`

const Layers = styled(LayersSVG)`
  width: 35px;
`

const Fleet = styled(FleetSVG)`
  width: 35px;
  height: 26px;
  padding-top: 9px;
`

export default Menu

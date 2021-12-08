import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Link, useRouteMatch } from 'react-router-dom'
import { ReactComponent as LayersSVG } from '../../icons/Couches.svg'
import { ReactComponent as FleetSVG } from '../../icons/Label_segment_de_flotte_white.svg'

const Menu = () => {
  const onRegulationPage = useRouteMatch('/backoffice/regulation')
  const onControlObjectivePage = useRouteMatch('/backoffice/control_objectives')

  return (
    <Wrapper>
      <Title>
        Backoffice
      </Title>
      <MenuLink
        style={{
          background: onRegulationPage ? COLORS.shadowBlue : 'none'
        }}
        to={'/backoffice/regulation'}
        title={'Zones réglementaires'}
      >
        <Layers/>
        <LinkText>
          Zones <br/>réglementaires
        </LinkText>
      </MenuLink>
      <MenuLink
        style={{
          background: onControlObjectivePage ? COLORS.shadowBlue : 'none'
        }}
        to={'/backoffice/control_objectives'}
        title={'Objectifs de contrôle'}
      >
        <Fleet/>
        <LinkText>
          Objectifs <br/>de contrôle
        </LinkText>
      </MenuLink>
  </Wrapper>
  )
}

const Title = styled.h1`
  font-size: 14px;
  margin-bottom: 20px;
`

const Wrapper = styled.div`
  width: 144px;
  height: 100vh;
  background: ${COLORS.charcoal};
  flex-shrink: 0;
  font-size: 11px;
  color: ${COLORS.gainsboro};
  padding: 15px 0;
  box-sizing: border-box;
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
  padding: 0 5px;
  height: 45px;
  margin-top: 10px;
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

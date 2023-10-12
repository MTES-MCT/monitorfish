// TODO Remove temporary `as any` and `@ts-ignore` (fresh migration to TS).

import { THEME } from '@mtes-mct/monitor-ui'
import { Link, useMatch } from 'react-router-dom'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import LayersSVG from '../../icons/Couches.svg?react'
import FleetSVG from '../../icons/Label_segment_de_flotte_white.svg?react'
import ControlObjectivesSVG from '../../icons/objectifs_controle.svg?react'

export function Menu() {
  const onRegulationPage = useMatch('/backoffice/regulation')
  const onControlObjectivePage = useMatch('/backoffice/control_objectives')
  const onFleetSegmentsPage = useMatch('/backoffice/fleet_segments')

  return (
    <Wrapper>
      <Title>Backoffice</Title>
      <MenuLink
        style={{
          background: onRegulationPage ? THEME.color.blueGray : 'none'
        }}
        title="Zones réglementaires"
        to="/backoffice/regulation"
      >
        <Layers />
        <LinkText>
          Zones <br />
          réglementaires
        </LinkText>
      </MenuLink>
      <MenuLink
        style={{
          background: onControlObjectivePage ? THEME.color.blueGray : 'none'
        }}
        title="Objectifs de contrôle"
        to="/backoffice/control_objectives"
      >
        <ControlObjectives />
        <LinkText>
          Objectifs <br />
          de contrôle
        </LinkText>
      </MenuLink>
      <MenuLink
        style={{
          background: onFleetSegmentsPage ? THEME.color.blueGray : 'none'
        }}
        title="Segments de flotte"
        to="/backoffice/fleet_segments"
      >
        <Fleet />
        <LinkText>
          Segments <br />
          de flotte
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

const ControlObjectives = styled(ControlObjectivesSVG)`
  width: 35px;
  height: 23px;
  padding-top: 10px;
`

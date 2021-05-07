import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { getDate } from '../../utils'
import { Title, Zone, StrongText, NoValue, Red, Green } from './Controls.style'
import { controlType } from '../../domain/entities/controls'

const LastControlZone = props => {
  const { lastControlList } = props

  const getResumeText = (control) => {
    if (control.controlType === controlType.SEA) {
      return 'Dernier contrôle en mer'
    } else if (control.controlType === controlType.LAND) {
      return 'Dernier contrôle en débarque'
    }
  }

  return <Zone>
    <Title>
        Derniers Contrôles
    </Title>
    {lastControlList.map((control, index) =>
      <Fields key={index}>
        <ControlResumeLine>
          <ResumeText>{getResumeText(control)}<StrongText>le {getDate(control.controlDatetimeUtc)}</StrongText></ResumeText>
        </ControlResumeLine>
        <ControlResumeLine>
          <LastControResumeElement>Unité <StrongText>{control.controller && control.controller.controller ? control.controller.controller : <NoValue>-</NoValue>}</StrongText></LastControResumeElement>
          <LastControResumeElement>Infractions <StrongText>{control.infraction ? <> {control.infractions.length} infraction{control.infractions.length > 1 ? 's' : ''} <Red/></> : <>Pas d&apos;infraction<Green/></>}</StrongText></LastControResumeElement>
        </ControlResumeLine>
      </Fields>)}
    </Zone>
}

const LastControResumeElement = styled.span`
  margin-right: 10px;
`

const ResumeText = styled.span`
  margin: 5px 0 0 0;
`

const Fields = styled.div`
  padding: 10px 5px 5px 20px; 
  width: 100%;
  margin: 0;
  line-height: 0.2em;
`

const ControlResumeLine = styled.div`
  margin: 0 5px 5px 0;
  border: none;
  background: none;
  font-size: 13px;
  color: ${COLORS.textGray};
  display: flex;
  width: 100%;
`

export default LastControlZone

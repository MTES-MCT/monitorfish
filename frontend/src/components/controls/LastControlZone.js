import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { getDate } from '../../utils'
import { Title, Zone, StrongText, NoValue, Red, Green } from './Controls.style'
import { controlType } from '../../domain/entities/controls'

const LastControlZone = props => {
  const { lastControlList } = props
  console.log(lastControlList)

  const ControlField = (field, type) => {
    const {
      control,
      text
    } = field

    return Object.keys(lastControlList).length > 0
      ? <Fields key={type}>
        <ControlResumeLine>
          <ResumeText>{text}<StrongText>le {getDate(control.controlDatetimeUtc)}</StrongText></ResumeText>
        </ControlResumeLine>
        <ControlResumeLine>
          <LastControResumeElement>Unité <StrongText>{control.controller && control.controller.controller ? control.controller.controller : <NoValue>-</NoValue>}</StrongText></LastControResumeElement>
          <LastControResumeElement>Infractions <StrongText>{control.infraction ? <> {control.infractions.length} infraction{control.infractions.length > 1 ? 's' : ''} <Red/></> : <>Pas d&apos;infraction<Green/></>}</StrongText></LastControResumeElement>
        </ControlResumeLine>
      </Fields>
      : null
  }

  return <Zone>
    <Title>
        Derniers Contrôles
    </Title>
    <ControlField field={lastControlList[controlType.SEA]} type={controlType.SEA} />
    <ControlField field={lastControlList[controlType.LAND]} type={controlType.LAND} />
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

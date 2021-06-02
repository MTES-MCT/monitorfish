import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { getDate } from '../../utils'
import { StrongText, NoValue, Red, Green } from './Controls.style'

const ControlField = ({ field, type, isFirst }) => {
  const {
    control,
    text
  } = field

  return <Fields key={type} isFirst={isFirst}>
    <ControlResumeLine>
      <ResumeText isFirst={isFirst}>
        {text}
        <StrongText>
          {
            control
              ? <>le {getDate(control.controlDatetimeUtc)}</>
              : <>Aucun</>
          }
        </StrongText>
      </ResumeText>
    </ControlResumeLine>
    {
      control
        ? <ControlResumeLine>
          <LastControlResumeElement>Unité <StrongText title={control.controller && control.controller.controller}>{control.controller && control.controller.controller ? control.controller.controller : <NoValue>-</NoValue>}</StrongText></LastControlResumeElement>
          <LastControlResumeElement>Infractions <StrongText>{control.infraction ? <> {control.infractions.length} infraction{control.infractions.length > 1 ? 's' : ''} <Red/></> : <>Pas d&apos;infraction<Green/></>}</StrongText></LastControlResumeElement>
        </ControlResumeLine>
        : null
    }

  </Fields>
}

const LastControlResumeElement = styled.span`
  margin-right: 10px;
`

const ResumeText = styled.span`
  margin: ${props => props.isFirst ? '5px' : '0'} 0 0 0;
`

const Fields = styled.div`
  padding: ${props => props.isFirst ? '10px' : '0'} 5px ${props => props.isFirst ? '5px' : '10px'} 20px; 
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

export default ControlField

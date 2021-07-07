import React, { useMemo } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { getDate } from '../../utils'
import { Green, NoValue, Red, StrongText } from './Controls.style'
import { getNumberOfInfractions } from '../../domain/entities/controls'

const ControlField = ({ field, type, isFirst }) => {
  const {
    /** @type {VesselControl} control */
    control,
    text
  } = field

  const numberOfInfractions = useMemo(() => {
    return getNumberOfInfractions(control)
  }, [control])

  return <Fields key={type} isFirst={isFirst}>
    <ControlResumeLine>
      <ResumeText isFirst={isFirst}>
        {text}
        <StrongText data-cy={"vessel-controls-last-control-date"}>
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
          <LastControlResumeElement data-cy={"vessel-controls-last-control-unit"}>Unité <StrongText
            title={control.controller && control.controller.controller}>{control.controller && control.controller.controller
              ? control.controller.controller
              : <NoValue>-</NoValue>}</StrongText></LastControlResumeElement>
          <LastControlResumeElement data-cy={"vessel-controls-last-control-infractions"}>Infractions <StrongText>{numberOfInfractions
            ? <> {numberOfInfractions} infraction{numberOfInfractions > 1 ? 's' : ''}
              <Red/></>
            : <>Pas d&apos;infraction<Green/></>}</StrongText></LastControlResumeElement>
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

import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as GyroSVG } from '../icons/Gyrophare_controles_gris.svg'
import { ReactComponent as WarningSVG } from '../icons/Attention_controles.svg'
import { NoValue, StrongText, Title, Zone } from './Controls.style'
import InfractionsResume from './InfractionsResume'

const ControlsResumeZone = props => {
  const {
    /** @type {ControlResume} resume */
    resume,
    controlsFromDate
  } = props

  const {
    numberOfSeaControls,
    numberOfLandControls,
    numberOfAerialControls,
    numberOfFishingInfractions,
    numberOfSecurityInfractions,
    numberOfDiversions,
    numberOfEscortsToQuay,
    numberOfSeizures
  } = resume

  const getText = value => {
    return !isNaN(value) ? value : <NoValue>-</NoValue>
  }

  return <Zone>
    <Title>Résumé des actions de contrôle depuis {controlsFromDate
      ? <>{controlsFromDate.getUTCFullYear() + 1}
        {' '}(sur {new Date().getFullYear() - controlsFromDate.getUTCFullYear() - 1} ans)</>
      : <NoValue>-</NoValue>}</Title>
    <Fields>
      <ControlResumeLine>
        <ResumeText>
          <Gyro/> Nombre de contrôles
        </ResumeText>
        <ControlResumeStrongTextElement>en
          mer <StrongText>{getText(numberOfSeaControls)}</StrongText></ControlResumeStrongTextElement>
        <ControlResumeStrongTextElement>débarque <StrongText>{getText(numberOfLandControls)}</StrongText></ControlResumeStrongTextElement>
        <ControlResumeStrongTextElement>aérien <StrongText>{getText(numberOfAerialControls)}</StrongText></ControlResumeStrongTextElement>
      </ControlResumeLine>
      <ControlResumeLine>
        <ResumeText>
          <Warning/> Nombre d&apos;infractions
        </ResumeText>
        <ControlResumeStrongTextElement>pêche <StrongText>{getText(numberOfFishingInfractions)}</StrongText></ControlResumeStrongTextElement>
        <ControlResumeStrongTextElement>sécurité <StrongText>{getText(numberOfSecurityInfractions)}</StrongText></ControlResumeStrongTextElement>
      </ControlResumeLine>
      <InfractionsResume
        numberOfDiversions={numberOfDiversions}
        numberOfEscortsToQuay={numberOfEscortsToQuay}
        numberOfSeizures={numberOfSeizures}
      />
    </Fields>
  </Zone>
}

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
    color: ${COLORS.slateGray};
    display: flex;
    width: 100%;
`

const ResumeText = styled.span`
    margin: 5px 0 0 0;
`

const ControlResumeStrongTextElement = styled.span`
    margin: 5px 10px 0 14px;
`

const Gyro = styled(GyroSVG)`
    width: 16px;
    vertical-align: top;
    margin-right: 5px;
`

const Warning = styled(WarningSVG)`
    width: 16px;
    vertical-align: top;
    margin-right: 5px;
`

export default ControlsResumeZone

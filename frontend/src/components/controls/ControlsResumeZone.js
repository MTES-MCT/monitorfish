import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as GyroSVG } from '../icons/Gyrophare_controles_gris.svg'
import { ReactComponent as WarningSVG } from '../icons/Attention_controles.svg'
import { Title, StrongText, NoValue, Zone } from './Controls.style'

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
    const toReturn = !isNaN(value) ? value : <NoValue>-</NoValue>
    return toReturn
  }

  return <Zone>
    <Title>Résumé des actions de contrôle depuis {controlsFromDate
      ? <>{controlsFromDate.getUTCFullYear() + 1}
        {' '}(sur { new Date().getFullYear() - controlsFromDate.getUTCFullYear() - 1 } ans)</>
      : <NoValue>-</NoValue>}</Title>
    <Fields>
      <ControlResumeLine>
        <ResumeText>
          <Gyro /> Nombre de contrôles
        </ResumeText>
        <ControlResumeStrongTextElement>en mer <StrongText>{getText(numberOfSeaControls)}</StrongText></ControlResumeStrongTextElement>
        <ControlResumeStrongTextElement>débarque <StrongText>{getText(numberOfLandControls)}</StrongText></ControlResumeStrongTextElement>
        <ControlResumeStrongTextElement>aérien <StrongText>{getText(numberOfAerialControls)}</StrongText></ControlResumeStrongTextElement>
      </ControlResumeLine>
      <ControlResumeLine>
        <ResumeText>
          <Warning /> Nombre d&apos;infractions
        </ResumeText>
        <ControlResumeStrongTextElement>pêche <StrongText>{getText(numberOfFishingInfractions)}</StrongText></ControlResumeStrongTextElement>
        <ControlResumeStrongTextElement>sécurité <StrongText>{getText(numberOfSecurityInfractions)}</StrongText></ControlResumeStrongTextElement>
      </ControlResumeLine>
      <ResumesBoxes>
        <ResumeBox>
          <ResumeBoxStrongText isRed={ resume.numberOfDiversions }>{getText(numberOfDiversions)}</ResumeBoxStrongText>
          <ResumeBoxText>Déroutement</ResumeBoxText>
        </ResumeBox>
        <ResumeBox>
          <ResumeBoxStrongText isRed={ resume.numberOfEscortsToQuay }>{getText(numberOfEscortsToQuay)}</ResumeBoxStrongText>
          <ResumeBoxText>Reconduite à quai</ResumeBoxText>
        </ResumeBox>
        <ResumeBox>
          <ResumeBoxStrongText isRed={ resume.numberOfSeizures }>{getText(numberOfSeizures)}</ResumeBoxStrongText>
          <ResumeBoxText>Appréhension</ResumeBoxText>
        </ResumeBox>
      </ResumesBoxes>
    </Fields>
  </Zone>
}

const ResumesBoxes = styled.div`
    display: flex;
    justify-content: space-between;
    margin-right: 15px;
`

const ResumeBoxText = styled.span`
    color: ${COLORS.grayDarkerThree};
    margin: 0 10px 0 5px;
    font-weight: medium;
`

const ResumeBoxStrongText = styled.span`
    background: ${props => props.isRed ? COLORS.red : COLORS.grayDarkerThree};
    color: ${COLORS.grayBackground};
    border-radius: 11px;
    height: 16px;
    display: inline-block;
    line-height: 14px;
    width: 16px;
    text-align: center;
    font-weight: bolder;
    margin: 3px 0 0 4px;
`

const ResumeBox = styled.span`
    background: ${COLORS.grayLighter};
    border-radius: 11px;
    font-size: 13px;
    height: 22px;
    display: inline-block;
    margin: 8px 5px 10px 0;
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

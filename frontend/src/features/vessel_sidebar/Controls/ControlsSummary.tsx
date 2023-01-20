import styled from 'styled-components'

import { InfractionsSummary } from './InfractionsSummary'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as WarningSVG } from '../../icons/Attention_controles.svg'
import { ReactComponent as GyroSVG } from '../../icons/Gyrophare_controles_gris.svg'
import { NoValue, StrongText, Title, Zone } from '../common_styles/common.style'

import type { ControlSummary } from '../../../domain/types/missionAction'

type ControlsResumeZoneProps = {
  controlsFromDate: Date
  summary: ControlSummary
}
export function ControlsSummary({ controlsFromDate, summary }: ControlsResumeZoneProps) {
  const {
    numberOfAerialControls,
    numberOfDiversions,
    numberOfEscortsToQuay,
    numberOfFishingInfractions,
    numberOfLandControls,
    numberOfSeaControls,
    numberOfSecurityInfractions,
    numberOfSeizures
  } = summary

  const getText = value => (!Number.isNaN(value) ? value : <NoValue>-</NoValue>)

  return (
    <Zone>
      <Title>
        Résumé des actions de contrôle depuis{' '}
        {controlsFromDate ? (
          <>
            {controlsFromDate.getUTCFullYear() + 1} (sur{' '}
            {new Date().getFullYear() - controlsFromDate.getUTCFullYear() - 1} ans)
          </>
        ) : (
          <NoValue>-</NoValue>
        )}
      </Title>
      <Fields>
        <ControlResumeLine>
          <ResumeText>
            <Gyro /> Nombre de contrôles
          </ResumeText>
          <Strong>
            en mer <StrongText>{getText(numberOfSeaControls)}</StrongText>
          </Strong>
          <Strong>
            débarque <StrongText>{getText(numberOfLandControls)}</StrongText>
          </Strong>
          <Strong>
            aérien <StrongText>{getText(numberOfAerialControls)}</StrongText>
          </Strong>
        </ControlResumeLine>
        <ControlResumeLine>
          <ResumeText>
            <Warning /> Nombre d&apos;infractions
          </ResumeText>
          <Strong>
            pêche <StrongText>{getText(numberOfFishingInfractions)}</StrongText>
          </Strong>
          <Strong>
            sécurité <StrongText>{getText(numberOfSecurityInfractions)}</StrongText>
          </Strong>
        </ControlResumeLine>
        <InfractionsSummary
          numberOfDiversions={numberOfDiversions}
          numberOfEscortsToQuay={numberOfEscortsToQuay}
          numberOfSeizures={numberOfSeizures}
        />
      </Fields>
    </Zone>
  )
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

const Strong = styled.span`
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

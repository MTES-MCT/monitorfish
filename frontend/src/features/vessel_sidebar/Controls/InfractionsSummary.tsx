import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { NoValue } from '../common_styles/common.style'

export function InfractionsSummary({ numberOfDiversions, numberOfEscortsToQuay, numberOfSeizures }) {
  const getText = value => (!Number.isNaN(value) ? value : <NoValue>-</NoValue>)

  return (
    <ResumesBoxes>
      <ResumeBox>
        <ResumeBoxStrongText isRed={numberOfDiversions}>{getText(numberOfDiversions)}</ResumeBoxStrongText>
        <ResumeBoxText>Déroutement</ResumeBoxText>
      </ResumeBox>
      <ResumeBox>
        <ResumeBoxStrongText isRed={numberOfEscortsToQuay}>{getText(numberOfEscortsToQuay)}</ResumeBoxStrongText>
        <ResumeBoxText>Reconduite à quai</ResumeBoxText>
      </ResumeBox>
      <ResumeBox>
        <ResumeBoxStrongText isRed={numberOfSeizures}>{getText(numberOfSeizures)}</ResumeBoxStrongText>
        <ResumeBoxText>Appréhension</ResumeBoxText>
      </ResumeBox>
    </ResumesBoxes>
  )
}

const ResumesBoxes = styled.div`
  display: flex;
  justify-content: space-between;
  margin-right: 15px;
`

const ResumeBoxText = styled.span`
  color: ${COLORS.charcoal};
  margin: 0 10px 0 5px;
  font-weight: 500;
`

const ResumeBoxStrongText = styled.span<{
  isRed: boolean
}>`
  background: ${props => (props.isRed ? COLORS.maximumRed : COLORS.charcoal)};
  color: ${COLORS.gainsboro};
  border-radius: 11px;
  height: 16px;
  display: inline-block;
  line-height: 14px;
  width: 16px;
  text-align: center;
  font-weight: bolder;
  margin: 3px 0 0 4px;
  font-weight: 500;
`

const ResumeBox = styled.span`
  background: ${COLORS.gainsboro};
  border-radius: 11px;
  font-size: 13px;
  height: 22px;
  display: inline-block;
  margin: 8px 5px 10px 0;
`

import { COLORS } from '@constants/constants'
import styled from 'styled-components'

import { RiskFactorBox } from './RiskFactorBox'
import RiskFactorControlSVG from '../../icons/Note_de_controle_gyrophare.svg?react'
import RiskFactorImpactSVG from '../../icons/Note_impact_poisson.svg?react'
import RiskFactorInfractionsSVG from '../../icons/Note_infraction_stop.svg?react'

export function RiskFactorExplanationSchema() {
  return (
    <Schema>
      <GlobalBox>
        <RiskFactorBox color={COLORS.charcoal} isBig>
          3.3
        </RiskFactorBox>
        Note de risque
      </GlobalBox>
      <SchemaText>=</SchemaText>
      <Box>
        <RiskFactorImpact />
        <RiskFactorExponent>0.2</RiskFactorExponent>
        <RiskFactorBox color={COLORS.slateGray}>2.6</RiskFactorBox>
        Score d&apos;impact
      </Box>
      <SchemaText>x</SchemaText>
      <Box>
        <MoreTopPadding>
          <RiskFactorInfractions />
          <RiskFactorExponent>0.3</RiskFactorExponent>
          <RiskFactorBox color={COLORS.slateGray}>3</RiskFactorBox>
          Score de probabilité d&apos;infraction
        </MoreTopPadding>
      </Box>
      <SchemaText>x</SchemaText>
      <Box>
        <RiskFactorControl />
        <RiskFactorExponent>0.5</RiskFactorExponent>
        <RiskFactorBox color={COLORS.slateGray}>3.5</RiskFactorBox>
        Score de &quot;détéctabilité&quot; (priorité et taux de contrôle)
      </Box>
    </Schema>
  )
}

const MoreTopPadding = styled.div`
  padding-top: 2px;
`

const RiskFactorExponent = styled.span`
  float: right;
  border: 1px solid ${p => p.theme.color.slateGray};
  width: fit-content;
  padding: 1px 5px;
  color: ${p => p.theme.color.slateGray};
  font-size: 11px;
  background: ${p => p.theme.color.white};
  margin-top: -20px;
  margin-right: -23px;
`

const RiskFactorImpact = styled(RiskFactorImpactSVG)`
  width: 22px;
  margin-right: 7px;
  margin-top: 4px;
  vertical-align: sub;
`

const RiskFactorControl = styled(RiskFactorControlSVG)`
  width: 22px;
  margin-right: 7px;
  margin-top: 0;
  vertical-align: sub;
`

const RiskFactorInfractions = styled(RiskFactorInfractionsSVG)`
  width: 22px;
  margin-right: 7px;
  margin-top: 0px;
  vertical-align: text-top;
`

const SchemaText = styled.span`
  margin: 10px;
`

const Box = styled.div`
  border: 1px solid ${p => p.theme.color.slateGray};
  width: fit-content;
  padding: 10px;
  color: ${p => p.theme.color.slateGray};
`

const GlobalBox = styled.div`
  border: 1px solid ${p => p.theme.color.charcoal};
  width: fit-content;
  padding: 11px 10px 10px 10px;
  color: ${p => p.theme.color.slateGray};
`

const Schema = styled.span`
  width: 100%;
  margin-top: 30px;
  margin-bottom: 30px;
  display: flex;
`

import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import RiskFactorControlSVG from '../../../icons/Note_de_controle_gyrophare.svg?react'
import RiskFactorImpactSVG from '../../../icons/Note_impact_poisson.svg?react'
import RiskFactorInfractionsSVG from '../../../icons/Note_infraction_stop.svg?react'
import { RiskFactorBox } from '../RiskFactorBox'

export function RiskFactorExplanationSchema() {
  return (
    <Schema>
      <GlobalBox>
        <RiskFactorBox color={THEME.color.charcoal} isBig>
          3.3
        </RiskFactorBox>
        Note de risque
      </GlobalBox>
      <SchemaText>=</SchemaText>
      <Box>
        <RiskFactorImpact />
        <RiskFactorExponent>0.2</RiskFactorExponent>
        <RiskFactorBox color={THEME.color.slateGray}>2.6</RiskFactorBox>
        Score d&apos;impact
      </Box>
      <SchemaText>x</SchemaText>
      <Box>
        <MoreTopPadding>
          <RiskFactorInfractions />
          <RiskFactorExponent>0.3</RiskFactorExponent>
          <RiskFactorBox color={THEME.color.slateGray}>3</RiskFactorBox>
          Score de probabilité d&apos;infraction
        </MoreTopPadding>
      </Box>
      <SchemaText>x</SchemaText>
      <Box>
        <RiskFactorControl />
        <RiskFactorExponent>0.5</RiskFactorExponent>
        <RiskFactorBox color={THEME.color.slateGray}>3.5</RiskFactorBox>
        Score de &quot;détéctabilité&quot; (priorité et taux de contrôle)
      </Box>
    </Schema>
  )
}

const MoreTopPadding = styled.div`
  padding-top: 2px;
`

const RiskFactorExponent = styled.span`
  background: ${p => p.theme.color.white};
  border: 1px solid ${p => p.theme.color.slateGray};
  color: ${p => p.theme.color.slateGray};
  float: right;
  font-size: 11px;
  margin-top: -20px;
  margin-right: -23px;
  padding: 1px 5px;
  width: fit-content;
`

const RiskFactorImpact = styled(RiskFactorImpactSVG)`
  margin-right: 7px;
  margin-top: 4px;
  vertical-align: sub;
  width: 22px;
`

const RiskFactorControl = styled(RiskFactorControlSVG)`
  margin-right: 7px;
  margin-top: 0;
  vertical-align: sub;
  width: 22px;
`

const RiskFactorInfractions = styled(RiskFactorInfractionsSVG)`
  margin-right: 7px;
  margin-top: 0px;
  vertical-align: text-top;
  width: 22px;
`

const SchemaText = styled.span`
  margin: 10px;
`

const Box = styled.div`
  border: 1px solid ${p => p.theme.color.slateGray};
  color: ${p => p.theme.color.slateGray};
  padding: 10px;
  width: fit-content;
`

const GlobalBox = styled.div`
  border: 1px solid ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.slateGray};
  padding: 11px 10px 10px 10px;
  width: fit-content;
`

const Schema = styled.span`
  display: flex;
  margin-top: 30px;
  margin-bottom: 30px;
  width: 100%;
`
